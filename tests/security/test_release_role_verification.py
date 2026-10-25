"""Execute the actual release shell blocks against synthetic Docker responses only."""

import os
import pathlib
import re
import subprocess
import tempfile
import textwrap
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[2]
IMAGE = "ghcr.io/example/rivalwatch@sha256:" + "a" * 64
IMAGE_ID = "sha256:" + "b" * 64
ROLES = ("rivalwatch_app", "rivalwatch_horizon", "rivalwatch_scheduler")


def release_shell():
    workflow = (ROOT / ".github/workflows/deploy.yml").read_text(encoding="utf-8")
    body = workflow.split("            bash -s << 'EOF'\n", 1)[1].split("\n          EOF", 1)[0]
    return textwrap.dedent(body)


def image_step():
    workflow = (ROOT / ".github/workflows/php-pr.yml").read_text(encoding="utf-8")
    step = workflow.split("      - name: Check actual PHP interpreters and extensions without startup\n", 1)[1]
    step = step.split("\n      - ", 1)[0]
    return step, textwrap.dedent(step.split("        run: |\n", 1)[1])


# Bash functions shadow Docker/sudo in this child only; no daemon, SSH, or host operation.
FAKE_DOCKER = r'''docker() {
    printf '%s\n' "$*" >> "$DOCKER_LOG"
    case "$1 $2" in
        login\ *|pull\ *) return 0 ;;
        "service ls")
            [[ "$SCENARIO" == ls_error ]] && return 6
            [[ "$SCENARIO" == empty_list ]] && return 0
            printf '%s\n' rivalwatch_app rivalwatch_horizon
            [[ "$SCENARIO" == missing_scheduler ]] || printf '%s\n' rivalwatch_scheduler
            return 0 ;;
        "service update")
            local role="${@: -1}"
            printf '%s\n' "$role" >> "$UPDATE_LOG"
            [[ "$SCENARIO" == "fail_${role}" ]] && return 7
            return 0 ;;
        "service inspect")
            [[ "$*" == *Replicas* ]] && { printf '1\n'; return 0; }
            if [[ "$SCENARIO" == bad_service_spec && "${@: -1}" == rivalwatch_app ]]; then
                printf 'ghcr.io/example/rivalwatch@sha256:%064d\n' 0
            else
                printf '%s\n' "$IMAGE"
            fi
            return 0 ;;
        "service ps")
            local role="${@: -1}"
            [[ "$SCENARIO" == missing_tasks && "$role" == rivalwatch_app ]] && return 0
            printf '%s\n' "${role}-task"
            [[ "$role" == rivalwatch_app && ( "$SCENARIO" == extra_live || "$SCENARIO" == history_* ) ]] && printf '%s\n' "${role}-old"
            return 0 ;;
        "container ls")
            [[ "$SCENARIO" == container_ls_error ]] && return 9
            local role='' arg
            for arg in "$@"; do
                [[ "$arg" == label=com.docker.swarm.service.name=* ]] && role="${arg##*=}"
            done
            [[ -n "$role" ]] || return 13
            [[ "$SCENARIO" == container_ls_missing && "$role" == rivalwatch_app ]] || printf '%s\n' "${role}-container"
            [[ "$role" == rivalwatch_app && "$SCENARIO" == extra_unlisted_running ]] && printf '%s\n' "${role}-container-old"
            return 0 ;;
        "image inspect") printf '%s\n' "$IMAGE_ID"; return 0 ;;
        "info --format") printf 'local-node\n'; return 0 ;;
        "inspect --type")
            local kind="$3" id="${@: -1}"
            if [[ "$kind" == task ]]; then
                if [[ "$id" == *-old ]]; then
                    if [[ "$SCENARIO" == history_* ]]; then
                        local history_state="${SCENARIO#history_}" history_node=local-node history_id="${id%-old}-container-old"
                        history_state="${history_state%%_*}"
                        [[ "$SCENARIO" == *_remote_* ]] && history_node=remote-node
                        [[ "$SCENARIO" == *_missing_id ]] && history_id=''
                        printf 'shutdown|%s|%s|%s|%s\n' "$history_state" "$IMAGE" "$history_node" "$history_id"
                    else
                        printf 'shutdown|running|%s|local-node|%s\n' "$IMAGE" "${id%-old}-container-old"
                    fi
                elif [[ "$SCENARIO" == transitional && "$id" == rivalwatch_app-* ]]; then
                    printf 'running|preparing|%s|local-node|\n' "$IMAGE"
                elif [[ "$SCENARIO" == stale_task_image && "$id" == rivalwatch_app-* ]]; then
                    printf 'running|running|ghcr.io/example/rivalwatch@sha256:%064d|local-node|%s\n' 0 "${id%-task}-container"
                elif [[ "$SCENARIO" == remote_node && "$id" == rivalwatch_app-* ]]; then
                    printf 'running|running|%s|remote-node|%s\n' "$IMAGE" "${id%-task}-container"
                else
                    printf 'running|running|%s|local-node|%s\n' "$IMAGE" "${id%-task}-container"
                fi
            elif [[ "$kind" == container ]]; then
                [[ "$SCENARIO" == unreadable_container && "$id" == rivalwatch_app-* ]] && return 8
                if [[ "$*" == *State.Status* ]]; then
                    [[ "$SCENARIO" == history_*_inspect_error && "$id" == *-old ]] && return 8
                    if [[ "$SCENARIO" == history_*_stopped && "$id" == *-old ]]; then
                        printf 'false|exited\n'
                    else
                        printf 'true|running\n'
                    fi
                    return 0
                fi
                local runtime_id="$IMAGE_ID" runtime_ref="$IMAGE"
                [[ "$SCENARIO" == stale_container_image && "$id" == rivalwatch_app-* ]] && runtime_id="sha256:$(printf 'c%.0s' {1..64})"
                [[ "$SCENARIO" == wrong_container_ref && "$id" == rivalwatch_app-* ]] && runtime_ref='ghcr.io/example/rivalwatch:latest'
                printf 'true|%s|%s\n' "$runtime_id" "$runtime_ref"
            else
                return 10
            fi
            return 0 ;;
    esac
    printf 'Unrecognized synthetic Docker call: %s\n' "$1 $2" >&2
    return 11
}
sudo() { [[ "$1" == docker ]] || return 12; shift; docker "$@"; }
sleep() { :; }
'''


class ReleaseRoleVerification(unittest.TestCase):
    def run_release(self, scenario, image=IMAGE):
        scratch = os.environ.get("TMPDIR") or tempfile.gettempdir()
        with tempfile.TemporaryDirectory(dir=scratch) as directory:
            log = pathlib.Path(directory) / "updates.txt"
            docker_log = pathlib.Path(directory) / "docker.txt"
            env = dict(os.environ, TMPDIR=scratch, TMP=scratch, TEMP=scratch,
                       SCENARIO=scenario, IMAGE=image, IMAGE_ID=IMAGE_ID,
                       UPDATE_LOG=str(log), DOCKER_LOG=str(docker_log),
                       DEPLOY_TOKEN="synthetic-only", GH_ACTOR="synthetic-only")
            env = {key: value for key, value in env.items() if not key.startswith("GIT_")}
            result = subprocess.run(["bash", "-e"], input=FAKE_DOCKER + release_shell() + "\n",
                                    env=env, text=True, capture_output=True, timeout=20)
            updates = log.read_text(encoding="utf-8").splitlines() if log.exists() else []
            result.docker_calls = docker_log.read_text(encoding="utf-8").splitlines() if docker_log.exists() else []
            return result, updates

    def assert_refused_after_updates(self, scenario):
        result, updates = self.run_release(scenario)
        self.assertEqual(updates, list(ROLES), result.stderr)
        self.assertNotIn("Unrecognized synthetic Docker call", result.stderr)
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertNotIn("Verified desired and running container image", result.stdout)
        return result

    def test_fpm_probe_rejects_matching_output_from_failed_docker(self):
        step, run = image_step()
        stub = "docker() { case \"$*\" in *php-fpm*) printf 'PHP 8.4.27 (fpm-fcgi)\\n'; return 42;; *) return 0;; esac; };\n"
        flags = ["-e"] + (["-o", "pipefail"] if re.search(r"(?m)^        shell: bash\s*$", step) else [])
        scratch = os.environ.get("TMPDIR") or tempfile.gettempdir()
        env = {key: value for key, value in os.environ.items() if not key.startswith("GIT_")}
        env.update(TMPDIR=scratch, TMP=scratch, TEMP=scratch)
        result = subprocess.run(["bash", *flags, "-c", stub + run], text=True,
                                capture_output=True, timeout=10, env=env)
        self.assertNotEqual(result.returncode, 0, "failed FPM producer must fail the real PR step")

    def test_preflight_requires_exact_complete_service_list_before_any_update(self):
        for case in ("ls_error", "empty_list", "missing_scheduler"):
            with self.subTest(case=case):
                result, updates = self.run_release(case)
                self.assertNotEqual(result.returncode, 0, result.stdout)
                self.assertEqual(updates, [], "preflight must not mutate even the app role")

    def test_mutable_or_malformed_image_reference_never_updates_services(self):
        for image in ("ghcr.io/example/rivalwatch:latest", "ghcr.io/example/rivalwatch@sha256:bad"):
            with self.subTest(image=image):
                result, updates = self.run_release("healthy", image=image)
                self.assertNotEqual(result.returncode, 0, result.stdout)
                self.assertEqual(updates, [])

    def test_every_required_service_update_failure_is_fatal(self):
        for role in ROLES:
            with self.subTest(role=role):
                result, updates = self.run_release("fail_" + role)
                self.assertNotEqual(result.returncode, 0, result.stdout)
                self.assertEqual(updates, list(ROLES[:ROLES.index(role) + 1]))

    def test_success_reads_actual_running_containers_for_all_roles(self):
        result, updates = self.run_release("healthy")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(updates, list(ROLES))
        self.assertIn("verified", result.stdout.lower())

    def test_healthy_roles_are_independently_enumerated(self):
        result, updates = self.run_release("healthy")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(updates, list(ROLES))
        for role in ROLES:
            self.assertTrue(any(call.startswith("container ls ") and
                                "label=com.docker.swarm.service.name=" + role in call
                                for call in result.docker_calls), role)

    def test_historical_nonterminal_and_orphaned_tasks_never_establish_stopped(self):
        for state in ("shutdown", "orphaned", "remove"):
            for location in ("local", "remote"):
                case = f"history_{state}_{location}_running"
                with self.subTest(case=case):
                    result = self.assert_refused_after_updates(case)
                    self.assertTrue(any("inspect --type task " in call and
                                        call.endswith("rivalwatch_app-old")
                                        for call in result.docker_calls))

    def test_terminal_label_with_live_local_container_is_not_stopped(self):
        result = self.assert_refused_after_updates("history_complete_local_running")
        self.assertTrue(any("inspect --type container " in call and
                            call.endswith("rivalwatch_app-container-old")
                            for call in result.docker_calls), "terminal state needs actual old-container inspection")

    def test_remote_terminal_history_cannot_be_verified_locally(self):
        self.assert_refused_after_updates("history_complete_remote_stopped")

    def test_genuinely_stopped_local_history_can_converge(self):
        for state in ("complete", "failed", "rejected"):
            with self.subTest(state=state):
                result, updates = self.run_release(f"history_{state}_local_stopped")
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(updates, list(ROLES))
                self.assertTrue(any("inspect --type container " in call and
                                    call.endswith("rivalwatch_app-container-old")
                                    for call in result.docker_calls))

    def test_unlisted_extra_running_service_container_blocks_verification(self):
        result = self.assert_refused_after_updates("extra_unlisted_running")
        self.assertTrue(any("container ls " in call and
                            "label=com.docker.swarm.service.name=rivalwatch_app" in call
                            for call in result.docker_calls))

    def test_running_container_enumeration_failure_cannot_pass(self):
        self.assert_refused_after_updates("container_ls_error")

    def test_missing_enumerated_running_container_cannot_pass(self):
        self.assert_refused_after_updates("container_ls_missing")

    def test_historical_container_inspection_failure_is_not_absence(self):
        self.assert_refused_after_updates("history_complete_local_inspect_error")

    def test_terminal_history_without_container_identity_cannot_pass(self):
        self.assert_refused_after_updates("history_complete_local_missing_id")

    def test_missing_extra_and_transitional_tasks_cannot_pass(self):
        for case in ("missing_tasks", "extra_live", "transitional"):
            with self.subTest(case=case):
                result, updates = self.run_release(case)
                self.assertNotEqual(result.returncode, 0, result.stdout)
                self.assertEqual(updates, list(ROLES))

    def test_service_task_and_container_images_must_all_agree(self):
        for case in ("bad_service_spec", "stale_task_image", "stale_container_image", "wrong_container_ref"):
            with self.subTest(case=case):
                result, updates = self.run_release(case)
                self.assertNotEqual(result.returncode, 0, result.stdout)
                self.assertEqual(updates, list(ROLES))

    def test_unreadable_or_remote_running_container_cannot_pass(self):
        for case in ("unreadable_container", "remote_node"):
            with self.subTest(case=case):
                result, updates = self.run_release(case)
                self.assertNotEqual(result.returncode, 0, result.stdout)
                self.assertEqual(updates, list(ROLES))

    def test_manual_setup_requires_reviewed_immutable_app_digest(self):
        manual = (ROOT / "docker/deploy-setup.md").read_text(encoding="utf-8")
        self.assertIn("IMAGE_SHA256", manual)
        self.assertIn("not", manual.lower())
        self.assertIn("immutable", manual.lower())
        self.assertLess(manual.index("**Hold:"), manual.index("```"),
                        "operator must see the hold before the historical template")
        self.assertNotIn("docker stack deploy -c", manual)
        self.assertNotIn("sudo mkdir", manual)
        self.assertNotIn("cat > .env", manual)


if __name__ == "__main__":
    unittest.main()
