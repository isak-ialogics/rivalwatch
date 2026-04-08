import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function SignificanceBadge({ significance }) {
    const styles = {
        high: 'bg-red-500/20 text-red-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        low: 'bg-emerald-500/20 text-emerald-400',
    };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-sm font-semibold ${styles[significance] ?? 'bg-slate-500/20 text-slate-400'}`}>
            {significance} significance
        </span>
    );
}

function TextPanel({ label, content }) {
    return (
        <div className="flex-1 min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <div className="h-64 overflow-auto rounded-lg bg-white/[0.03] border border-white/[0.07] p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap">
                {content ?? <span className="italic text-slate-600">No content captured</span>}
            </div>
        </div>
    );
}

export default function ChangeShow({ change }) {
    const competitor = change.monitored_page?.competitor;
    const page = change.monitored_page;

    let analysisText = change.ai_analysis;
    if (analysisText) {
        analysisText = analysisText.replace(/^ANALYSIS:\s*/im, '').replace(/\nSIGNIFICANCE:.*$/im, '').trim();
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('changes.index')} className="text-slate-500 hover:text-slate-300">Changes</Link>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-200 font-medium">{competitor?.name} &middot; {page?.page_type}</span>
                </div>
            }
        >
            <Head title={`Change: ${competitor?.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Meta */}
                    <div className="glass-card flex flex-wrap items-start justify-between gap-4 rounded-xl p-6">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-200">
                                {competitor?.name} — {page?.page_type} page changed
                            </h2>
                            <a
                                href={page?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 text-sm text-cyan-400 hover:underline"
                            >
                                {page?.url}
                            </a>
                            <p className="mt-1 text-xs text-slate-500">
                                Detected {new Date(change.detected_at).toLocaleString()}
                            </p>
                        </div>
                        <SignificanceBadge significance={change.significance} />
                    </div>

                    {/* AI Analysis */}
                    {analysisText && (
                        <div className="glass-card-cyan rounded-xl p-5">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-400">AI analysis</p>
                            <p className="text-sm text-cyan-100">{analysisText}</p>
                        </div>
                    )}

                    {/* Diff summary */}
                    {change.diff_summary && (
                        <div className="glass-card rounded-xl p-5">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Diff summary</p>
                            <pre className="whitespace-pre-wrap text-sm text-slate-300">{change.diff_summary}</pre>
                        </div>
                    )}

                    {/* Before / After text content */}
                    <div className="glass-card rounded-xl p-5">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Page content comparison</p>
                        <div className="flex gap-4">
                            <TextPanel
                                label={`Before · ${change.snapshot_before ? new Date(change.snapshot_before.captured_at).toLocaleString() : ''}`}
                                content={change.snapshot_before?.text_content}
                            />
                            <TextPanel
                                label={`After · ${change.snapshot_after ? new Date(change.snapshot_after.captured_at).toLocaleString() : ''}`}
                                content={change.snapshot_after?.text_content}
                            />
                        </div>
                    </div>

                    {/* Screenshots */}
                    {(change.snapshot_before?.screenshot_path || change.snapshot_after?.screenshot_path) && (
                        <div className="glass-card rounded-xl p-5">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Screenshot comparison</p>
                            <div className="flex gap-4">
                                {change.snapshot_before?.screenshot_path && (
                                    <div className="flex-1">
                                        <p className="mb-2 text-xs text-slate-500">Before</p>
                                        <img
                                            src={`/storage/${change.snapshot_before.screenshot_path}`}
                                            alt="Before screenshot"
                                            className="w-full rounded-lg border border-white/[0.07]"
                                        />
                                    </div>
                                )}
                                {change.snapshot_after?.screenshot_path && (
                                    <div className="flex-1">
                                        <p className="mb-2 text-xs text-slate-500">After</p>
                                        <img
                                            src={`/storage/${change.snapshot_after.screenshot_path}`}
                                            alt="After screenshot"
                                            className="w-full rounded-lg border border-white/[0.07]"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
