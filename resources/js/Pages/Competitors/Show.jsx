import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

const PAGE_TYPES = ['homepage', 'pricing', 'features', 'about', 'blog', 'careers', 'generic'];
const FREQUENCIES = ['hourly', 'daily', 'weekly'];

function SignificanceBadge({ significance }) {
    const styles = {
        high: 'bg-red-500/20 text-red-400 ring-red-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30',
        low: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[significance] ?? 'bg-slate-500/20 text-slate-400 ring-slate-500/30'}`}>
            {significance}
        </span>
    );
}

function MiniStat({ label, value, color = 'slate' }) {
    const colors = {
        cyan: 'text-cyan-400',
        emerald: 'text-emerald-400',
        purple: 'text-purple-400',
        slate: 'text-slate-300',
    };
    return (
        <div className="text-center">
            <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
        </div>
    );
}

function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function PageTypeBadge({ type }) {
    const colors = {
        homepage: 'bg-cyan-500/15 text-cyan-400 ring-cyan-500/20',
        pricing: 'bg-orange-500/15 text-orange-400 ring-orange-500/20',
        features: 'bg-purple-500/15 text-purple-400 ring-purple-500/20',
        blog: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20',
        careers: 'bg-pink-500/15 text-pink-400 ring-pink-500/20',
        about: 'bg-blue-500/15 text-blue-400 ring-blue-500/20',
        generic: 'bg-slate-500/15 text-slate-400 ring-slate-500/20',
    };
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colors[type] ?? colors.generic}`}>
            {type}
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
    const lastChecked = page.last_checked_at ? new Date(page.last_checked_at) : null;
    const isStale = lastChecked && (Date.now() - lastChecked.getTime()) > 48 * 60 * 60 * 1000;

    return (
        <div className="glass-card group rounded-xl p-4 transition hover:bg-white/[0.03]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <PageTypeBadge type={page.page_type} />
                        <span className={`inline-block h-2 w-2 rounded-full ${
                            page.is_active === false ? 'bg-slate-600' : isStale ? 'bg-yellow-400' : 'bg-emerald-400'
                        }`} title={page.is_active === false ? 'Inactive' : isStale ? 'Stale' : 'Active'} />
                    </div>
                    <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 block truncate text-sm text-cyan-400 hover:underline"
                    >
                        {page.url}
                    </a>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {page.check_frequency}
                        </span>
                        <span>{page.snapshots_count ?? 0} snapshots</span>
                        <span className={page.changes_count > 0 ? 'text-purple-400' : ''}>{page.changes_count ?? 0} changes</span>
                        {lastChecked && (
                            <span className={isStale ? 'text-yellow-400' : ''}>
                                checked {timeAgo(lastChecked)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    <button
                        onClick={() => checkNow(route('monitored-pages.check-now', page.id))}
                        disabled={processing}
                        className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-medium text-cyan-400 transition hover:bg-cyan-500/15 disabled:opacity-50"
                    >
                        {processing ? 'Checking...' : 'Check now'}
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Remove this page?')) {
                                destroy(route('monitored-pages.destroy', page.id));
                            }
                        }}
                        disabled={processing}
                        className="rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CompetitorShow({ competitor, recentChanges, competitorStats }) {
    const [showAddPage, setShowAddPage] = useState(false);
    const [changeFilter, setChangeFilter] = useState('all');

    const filteredChanges = changeFilter === 'all'
        ? recentChanges
        : recentChanges.filter((c) => c.significance === changeFilter);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('competitors.index')} className="text-slate-500 hover:text-slate-300">
                        Competitors
                    </Link>
                    <span className="text-slate-600">/</span>
                    <h2 className="f-display text-xl font-bold text-slate-200">{competitor.name}</h2>
                </div>
            }
        >
            <Head title={competitor.name} />

            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* Competitor info card with stats */}
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-lg font-bold text-slate-200 ring-1 ring-white/[0.08]">
                                    {competitor.name.charAt(0).toUpperCase()}
                                </div>
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
                                        <p className="mt-2 max-w-lg text-sm text-slate-400">{competitor.notes}</p>
                                    )}
                                </div>
                            </div>

                            {/* Stats strip */}
                            <div className="flex items-center gap-6 rounded-xl border border-white/[0.07] bg-white/[0.02] px-6 py-3">
                                <MiniStat label="Pages" value={competitorStats?.total_pages ?? 0} color="cyan" />
                                <div className="h-8 w-px bg-white/[0.07]" />
                                <MiniStat label="Active" value={competitorStats?.active_pages ?? 0} color="emerald" />
                                <div className="h-8 w-px bg-white/[0.07]" />
                                <MiniStat label="Changes" value={competitorStats?.total_changes ?? 0} color="purple" />
                            </div>
                        </div>

                        {competitorStats?.last_checked_at && (
                            <div className="mt-4 border-t border-white/[0.05] pt-3">
                                <p className="text-xs text-slate-500">
                                    Last checked: {timeAgo(new Date(competitorStats.last_checked_at))}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Monitored pages */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="f-display text-base font-semibold text-slate-200">
                                Monitored pages ({competitor.monitored_pages?.length ?? 0})
                            </h3>
                            {!showAddPage && (
                                <button
                                    onClick={() => setShowAddPage(true)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-400 transition hover:bg-cyan-500/15"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add page
                                </button>
                            )}
                        </div>

                        {showAddPage && (
                            <div className="mb-3">
                                <AddPageForm competitorId={competitor.id} onCancel={() => setShowAddPage(false)} />
                            </div>
                        )}

                        {competitor.monitored_pages?.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-white/[0.1] p-10 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
                                    <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-slate-300">No pages monitored yet</p>
                                <p className="mt-1 text-xs text-slate-500">Pages are auto-discovered when you add a competitor, or add them manually above.</p>
                                {!showAddPage && (
                                    <button
                                        onClick={() => setShowAddPage(true)}
                                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-cyan-400"
                                    >
                                        Add a page manually
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {competitor.monitored_pages?.map((page) => (
                                    <MonitoredPageRow key={page.id} page={page} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Recent changes with filter */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="f-display text-base font-semibold text-slate-200">Change history</h3>
                            <Link
                                href={`${route('changes.index')}?competitor=${competitor.id}`}
                                className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                            >
                                View all &rarr;
                            </Link>
                        </div>

                        {/* Significance filter pills */}
                        <div className="mb-3 flex gap-1.5">
                            {['all', 'high', 'medium', 'low'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setChangeFilter(f)}
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition ${
                                        changeFilter === f
                                            ? 'bg-white/[0.1] text-slate-200 ring-1 ring-white/[0.15]'
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {recentChanges.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-white/[0.1] p-10 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                                    <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-slate-300">No changes detected yet</p>
                                <p className="mt-1 text-xs text-slate-500">Changes will appear here as monitored pages are checked.</p>
                            </div>
                        ) : filteredChanges.length === 0 ? (
                            <div className="rounded-xl border border-white/[0.05] p-8 text-center">
                                <p className="text-sm text-slate-500">No {changeFilter} significance changes.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredChanges.map((change) => (
                                    <Link
                                        key={change.id}
                                        href={route('changes.show', change.id)}
                                        className="glass-card group block rounded-xl p-4 transition hover:bg-white/[0.04]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <PageTypeBadge type={change.monitored_page?.page_type} />
                                                    <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                                                        page changed
                                                    </span>
                                                </div>
                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                    {change.monitored_page?.url}
                                                </p>
                                                {change.diff_summary && (
                                                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-400">
                                                        {change.diff_summary.split('\n')[0]}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-1">
                                                <SignificanceBadge significance={change.significance} />
                                                <span className="text-xs text-slate-600">
                                                    {timeAgo(new Date(change.detected_at))}
                                                </span>
                                            </div>
                                        </div>
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
