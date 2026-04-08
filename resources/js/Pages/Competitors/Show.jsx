import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

const PAGE_TYPES = ['homepage', 'pricing', 'features', 'about', 'blog', 'careers', 'generic'];
const FREQUENCIES = ['hourly', 'daily', 'weekly'];

function SignificanceBadge({ significance }) {
    const styles = {
        high: 'bg-red-500/20 text-red-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        low: 'bg-emerald-500/20 text-emerald-400',
    };
    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${styles[significance] ?? 'bg-slate-500/20 text-slate-400'}`}>
            {significance}
        </span>
    );
}

function AddPageForm({ competitorId, onCancel }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        url: '',
        page_type: 'generic',
        check_frequency: 'daily',
    });

    function submit(e) {
        e.preventDefault();
        post(route('monitored-pages.store', competitorId), {
            onSuccess: () => { reset(); onCancel(); },
        });
    }

    return (
        <form onSubmit={submit} className="glass-card-cyan rounded-xl p-5">
            <h4 className="mb-3 text-sm font-semibold text-slate-300">Add monitored page</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-slate-400">URL</label>
                    <input
                        type="url"
                        value={data.url}
                        onChange={(e) => setData('url', e.target.value)}
                        className="mt-1 block w-full rounded-lg border-white/[0.1] bg-white/[0.05] text-sm text-slate-200 shadow-sm placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500"
                        placeholder="https://acmecorp.com/pricing"
                        required
                    />
                    {errors.url && <p className="mt-1 text-xs text-red-400">{errors.url}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400">Page type</label>
                    <select
                        value={data.page_type}
                        onChange={(e) => setData('page_type', e.target.value)}
                        className="mt-1 block w-full rounded-lg border-white/[0.1] bg-white/[0.05] text-sm text-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                    >
                        {PAGE_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400">Frequency</label>
                    <select
                        value={data.check_frequency}
                        onChange={(e) => setData('check_frequency', e.target.value)}
                        className="mt-1 block w-full rounded-lg border-white/[0.1] bg-white/[0.05] text-sm text-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                    >
                        {FREQUENCIES.map((f) => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="mt-3 flex gap-2">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-cyan-400 disabled:opacity-60"
                >
                    {processing ? 'Adding...' : 'Add page'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-white/[0.1] px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/[0.05]"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

function MonitoredPageRow({ page }) {
    const { post: checkNow, delete: destroy, processing } = useForm();

    return (
        <div className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-sm">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="rounded bg-white/[0.08] px-1.5 py-0.5 text-xs font-medium text-slate-400">{page.page_type}</span>
                    <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-cyan-400 hover:underline"
                    >
                        {page.url}
                    </a>
                </div>
                <p className="mt-0.5 text-xs text-slate-600">
                    {page.check_frequency} &middot; {page.snapshots_count ?? 0} snapshots &middot; {page.changes_count ?? 0} changes
                    {page.last_checked_at && ` · last checked ${new Date(page.last_checked_at).toLocaleDateString()}`}
                </p>
            </div>
            <div className="ml-3 flex shrink-0 items-center gap-2">
                <button
                    onClick={() => checkNow(route('monitored-pages.check-now', page.id))}
                    disabled={processing}
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                >
                    Check now
                </button>
                <button
                    onClick={() => {
                        if (confirm('Remove this page?')) {
                            destroy(route('monitored-pages.destroy', page.id));
                        }
                    }}
                    disabled={processing}
                    className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                    Remove
                </button>
            </div>
        </div>
    );
}

export default function CompetitorShow({ competitor, recentChanges }) {
    const [showAddPage, setShowAddPage] = useState(false);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('competitors.index')} className="text-slate-500 hover:text-slate-300">
                        Competitors
                    </Link>
                    <span className="text-slate-600">/</span>
                    <h2 className="text-xl font-semibold text-slate-200">{competitor.name}</h2>
                </div>
            }
        >
            <Head title={competitor.name} />

            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* Competitor info */}
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-200">{competitor.name}</h3>
                                <a
                                    href={`https://${competitor.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-cyan-400 hover:underline"
                                >
                                    {competitor.domain}
                                </a>
                                {competitor.notes && (
                                    <p className="mt-2 text-sm text-slate-400">{competitor.notes}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Monitored pages */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-200">
                                Monitored pages ({competitor.monitored_pages?.length ?? 0})
                            </h3>
                            {!showAddPage && (
                                <button
                                    onClick={() => setShowAddPage(true)}
                                    className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-400 hover:bg-cyan-500/15"
                                >
                                    + Add page
                                </button>
                            )}
                        </div>

                        {showAddPage && (
                            <div className="mb-3">
                                <AddPageForm competitorId={competitor.id} onCancel={() => setShowAddPage(false)} />
                            </div>
                        )}

                        {competitor.monitored_pages?.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-white/[0.1] py-10 text-center text-sm text-slate-400">
                                No pages yet. Pages are auto-discovered when you add a competitor, or add them manually.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {competitor.monitored_pages?.map((page) => (
                                    <MonitoredPageRow key={page.id} page={page} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Recent changes */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-200">Recent changes</h3>
                            <Link
                                href={`${route('changes.index')}?competitor=${competitor.id}`}
                                className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                            >
                                View all &rarr;
                            </Link>
                        </div>

                        {recentChanges.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-white/[0.1] py-10 text-center text-sm text-slate-400">
                                No changes detected yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentChanges.map((change) => (
                                    <Link
                                        key={change.id}
                                        href={route('changes.show', change.id)}
                                        className="glass-card block rounded-xl p-4 transition hover:bg-white/[0.04]"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-200">
                                                    {change.monitored_page?.page_type} page changed
                                                </p>
                                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                                    {change.monitored_page?.url}
                                                </p>
                                                {change.diff_summary && (
                                                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                                        {change.diff_summary.split('\n')[0]}
                                                    </p>
                                                )}
                                            </div>
                                            <SignificanceBadge significance={change.significance} />
                                        </div>
                                        <p className="mt-2 text-xs text-slate-600">
                                            {new Date(change.detected_at).toLocaleString()}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
