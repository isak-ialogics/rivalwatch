import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function SignificanceBadge({ significance }) {
    const styles = {
        high: 'bg-red-100 text-red-700',
        medium: 'bg-yellow-100 text-yellow-700',
        low: 'bg-green-100 text-green-700',
    };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-sm font-semibold ${styles[significance] ?? 'bg-gray-100 text-gray-600'}`}>
            {significance} significance
        </span>
    );
}

function TextPanel({ label, content }) {
    return (
        <div className="flex-1 min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            <div className="h-64 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700 font-mono whitespace-pre-wrap">
                {content ?? <span className="italic text-gray-400">No content captured</span>}
            </div>
        </div>
    );
}

export default function ChangeShow({ change }) {
    const competitor = change.monitored_page?.competitor;
    const page = change.monitored_page;

    // Parse AI analysis
    let analysisText = change.ai_analysis;
    if (analysisText) {
        analysisText = analysisText.replace(/^ANALYSIS:\s*/im, '').replace(/\nSIGNIFICANCE:.*$/im, '').trim();
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('changes.index')} className="text-gray-400 hover:text-gray-600">Changes</Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-800 font-medium">{competitor?.name} · {page?.page_type}</span>
                </div>
            }
        >
            <Head title={`Change: ${competitor?.name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Meta */}
                    <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {competitor?.name} — {page?.page_type} page changed
                            </h2>
                            <a
                                href={page?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 text-sm text-blue-600 hover:underline"
                            >
                                {page?.url}
                            </a>
                            <p className="mt-1 text-xs text-gray-400">
                                Detected {new Date(change.detected_at).toLocaleString()}
                            </p>
                        </div>
                        <SignificanceBadge significance={change.significance} />
                    </div>

                    {/* AI Analysis */}
                    {analysisText && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-500">AI analysis</p>
                            <p className="text-sm text-blue-900">{analysisText}</p>
                        </div>
                    )}

                    {/* Diff summary */}
                    {change.diff_summary && (
                        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Diff summary</p>
                            <pre className="whitespace-pre-wrap text-sm text-gray-700">{change.diff_summary}</pre>
                        </div>
                    )}

                    {/* Before / After text content */}
                    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Page content comparison</p>
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
                        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Screenshot comparison</p>
                            <div className="flex gap-4">
                                {change.snapshot_before?.screenshot_path && (
                                    <div className="flex-1">
                                        <p className="mb-2 text-xs text-gray-400">Before</p>
                                        <img
                                            src={`/storage/${change.snapshot_before.screenshot_path}`}
                                            alt="Before screenshot"
                                            className="w-full rounded-lg border border-gray-200"
                                        />
                                    </div>
                                )}
                                {change.snapshot_after?.screenshot_path && (
                                    <div className="flex-1">
                                        <p className="mb-2 text-xs text-gray-400">After</p>
                                        <img
                                            src={`/storage/${change.snapshot_after.screenshot_path}`}
                                            alt="After screenshot"
                                            className="w-full rounded-lg border border-gray-200"
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
