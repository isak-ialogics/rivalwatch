"""Dependency-free PHP runtime/source contracts for PR validation."""

import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[2]
FLOOR = 80427


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def steps(yaml):
    """Extract one GitHub Actions step at a time, preserving indentation."""
    return re.findall(r"(?ms)^      - (?:name|uses):.*?(?=^      - (?:name|uses):|^  [a-z][\w-]*:|\Z)", yaml)


def assert_setup_guards(yaml):
    all_steps = steps(yaml)
    setup_indexes = [i for i, step in enumerate(all_steps) if "shivammathur/setup-php@v2" in step]
    assert setup_indexes, "PHP setup step missing"
    for i in setup_indexes:
        step = all_steps[i]
        assert re.search(r"(?m)^        env:\s*\n          update: true\s*$", step), "PHP setup step must have its own env.update: true"
        assert not re.search(r"(?m)^        (?:if|continue-on-error):", step), "PHP setup must be unconditional"
        assert i + 1 < len(all_steps), "PHP version guard step missing"
        guard = all_steps[i + 1]
        assert not re.search(r"(?m)^        (?:if|continue-on-error):", guard), "PHP guard must be unconditional"
        assert re.search(rf"PHP_VERSION_ID\s*<\s*{FLOOR}", guard) and re.search(r"PHP_VERSION_ID\s*>=\s*80500", guard), "same-minor lower and upper bounds required"
        assert "exit(1)" in guard and "php -r '" in guard, "guard must fail nonzero from actual PHP"
        assert not re.search(r"\|\|\s*true|set\s+\+e", guard), "guard may not mask failure"
        assert re.search(r"(?m)^        run: (?:\||>[-]?)", guard), "PHP guard must execute"


class PHPSourceContract(unittest.TestCase):
    def test_executing_php_stages_are_pinned_and_checked(self):
        dockerfile = read("Dockerfile")
        self.assertRegex(dockerfile, r"(?m)^FROM composer:2@sha256:[0-9a-f]{64} AS vendor$")
        self.assertRegex(dockerfile, r"(?m)^FROM php:8\.4\.27-fpm-alpine@sha256:[0-9a-f]{64} AS app$")
        self.assertIn("composer:2@sha256:da624c2c705d54e2f5a9bb77a5dc6c7d091711433ebefd7035672e84c2010fee", dockerfile)
        self.assertIn("php:8.4.27-fpm-alpine@sha256:8ce34c869fae0f8da2c82d8aeda222f0782e8e5ae2b370fb43cbad84e9e2ea55", dockerfile)
        for stage, next_line in (("vendor", "WORKDIR /app"), ("app", "LABEL ")):
            block = dockerfile.split(" AS " + stage + "\n", 1)[1]
            first = block.splitlines()[0]
            self.assertTrue(first.startswith("RUN php -r "), (stage, first))
            self.assertIn("PHP_VERSION_ID", first)
            self.assertIn("exit(1)", first)
            self.assertIn(next_line, block)

    def test_release_php_setup_immediately_checks_actual_version(self):
        assert_setup_guards(read(".github/workflows/deploy.yml"))

    def test_app_entrypoints_guard_before_autoload_or_migration(self):
        artisan = read("artisan")
        web = read("public/index.php")
        entrypoint = read("docker/entrypoint.sh")
        self.assertLess(artisan.index("bootstrap/php-version.php"), artisan.index("vendor/autoload.php"))
        self.assertLess(web.index("bootstrap/php-version.php"), web.index("storage/framework/maintenance.php"))
        self.assertLess(web.index("bootstrap/php-version.php"), web.index("vendor/autoload.php"))
        self.assertLess(entrypoint.index("bootstrap/php-version.php"), entrypoint.index("php artisan migrate --force"))
        guard = read("bootstrap/php-version.php")
        self.assertIn("PHP_VERSION_ID", guard)
        self.assertIn("error_log(", guard)
        self.assertIn("http_response_code(503)", guard)
        self.assertIn("PHP_SAPI === 'cli'", guard)

    def test_compose_php_roles_require_reviewed_application_digest(self):
        compose = read("docker-compose.prod.yml")
        for service in ("app", "horizon", "scheduler"):
            match = re.search(rf"(?m)^  {service}:\n    image: (.*)$", compose)
            self.assertIsNotNone(match)
            image = match.group(1)
            self.assertIn("@sha256:${IMAGE_SHA256:?", image)
            self.assertNotIn("IMAGE_TAG", image)
            self.assertNotIn("8ce34c869fae0f8da2c82d8aeda222f0782e8e5ae2b370fb43cbad84e9e2ea55", image)

    def test_release_uses_published_app_digest_without_pr_trigger(self):
        release = read(".github/workflows/deploy.yml")
        triggers = release.split("concurrency:", 1)[0]
        self.assertIn("  push:\n    branches: [master]", triggers)
        self.assertIn("  workflow_dispatch:", triggers)
        self.assertNotIn("pull_request", triggers)
        self.assertRegex(release, r"IMAGE: \$\{\{ env.REGISTRY \}\}/\$\{\{ env.IMAGE_NAME \}\}@\$\{\{ needs.build-and-push.outputs.image-digest \}\}")
        self.assertIn("image-digest: ${{ steps.build.outputs.digest }}", release)

    def test_pr_validation_is_read_only_and_exercises_locked_app_and_images(self):
        path = ROOT / ".github/workflows/php-pr.yml"
        self.assertTrue(path.exists(), "missing separate read-only pull-request workflow")
        pr = path.read_text(encoding="utf-8")
        triggers = pr.split("permissions:", 1)[0]
        self.assertRegex(triggers, r"(?m)^  pull_request:$")
        self.assertNotRegex(triggers, r"(?m)^  (?:push|workflow_dispatch):$")
        self.assertIn("permissions:\n  contents: read", pr)
        self.assertNotIn("packages: write", pr)
        assert_setup_guards(pr)
        self.assertIn("python3 -m unittest discover -s tests/security", pr)
        self.assertIn("php tests/security/php_version_guard.php", pr)
        self.assertIn("composer install", pr)
        self.assertIn("npm ci", pr)
        self.assertIn("npm run build", pr)
        self.assertIn("php artisan test", pr)
        self.assertIn("docker build --target vendor", pr)
        self.assertIn("docker build --target app", pr)
        self.assertIn("docker run --rm --network none --entrypoint php ", pr)
        self.assertIn("docker run --rm --network none --entrypoint php-fpm ", pr)
        for forbidden in ("docker/login-action", "docker push", "--push", "ssh ", "deploy-swarm:", "workflow_dispatch:"):
            self.assertNotIn(forbidden, pr)

    def test_mutated_setup_and_guards_fail_closed(self):
        original = read(".github/workflows/deploy.yml")
        own_update = "        env:\n          update: true\n"
        for case, unsafe in enumerate((
            original.replace(own_update, "", 1),
            original.replace("update: true", "update: false", 1),
            original.replace(own_update, "      env:\n        update: true\n", 1),
            original.replace(own_update, "", 1).replace("      - name: Verify actual PHP security version", "      - name: Verify actual PHP security version\n        env:\n          update: true", 1),
            original.replace("      - name: Verify actual PHP security version", "      - name: Verify actual PHP security version\n        if: always()", 1),
            original.replace("      - name: Verify actual PHP security version", "      - name: Verify actual PHP security version\n        continue-on-error: true", 1),
            original.replace("      - name: Verify actual PHP security version", "      - name: Verify actual PHP security version\n        run: true\n\n      - name: Different step", 1),
            original.replace("exit(1)", "print('unsafe')", 1),
            original.replace("exit(1)", "exit(1); }' || true", 1),
        )):
            with self.subTest(case=case):
                with self.assertRaises(AssertionError):
                    assert_setup_guards(unsafe)

    def test_version_guard_without_nonzero_exit_is_rejected(self):
        unsafe = read(".github/workflows/deploy.yml").replace("exit(1)", "print('unsafe')", 1)
        with self.assertRaises(AssertionError):
            assert_setup_guards(unsafe)


if __name__ == "__main__":
    unittest.main()
