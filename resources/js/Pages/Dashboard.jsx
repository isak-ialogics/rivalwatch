import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

function TrendArrow({ current, previous }) {
    if (previous === 0 && current === 0) return null;
    if (previous === 0) return <span className="text-xs font-medium text-emerald-400">new</span>;
    const pct = Math.round(((current - previous) / previous) * 100);
    if (pct === 0) return <span className="text-xs text-slate-500">no change</span>;
    const up = pct > 0;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? 'text-emerald-400' : 'text-red-400'}`}>
            <svg className={`h-3 w-3 ${up ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            {Math.abs(pct)}%
        </span>
    );
}

function StatCard({ label, value, icon, color = 'cyan', trend }) {
    const colors = {
        cyan: 'from-cyan-500/15 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
        emerald: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
        purple: 'from-purple-500/15 to-purple-500/5 border-purple-500/20 text-purple-400',
        orange: 'from-orange-500/15 to-orange-500/5 border-orange-500/20 text-orange-400',
    };
    return (
        <div className={`rounded-xl border bg-gradient-to-br p-5 ${colors[color]}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-400">{label}</p>
                    <p className="mt-1 text-3xl font-bold">{value}</p>
                </div>
                <div className="rounded-lg bg-white/[0.05] p-2 text-current opacity-60">
                    {icon}
                </div>
            </div>
            {trend && (
                <div className="mt-3 flex items-center gap-1.5 border-t border-white/[0.05] pt-3">
                    <TrendArrow current={trend.current} previous={trend.previous} />
                    <span className="text-xs text-slate-500">vs last week</span>
                </div>
            )}
        </div>
    );
}

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

function CompetitorHealthCard({ competitor }) {
    const lastChecked = competitor.monitored_pages_max_last_checked_at;
    const timeSince = lastChecked ? timeAgo(new Date(lastChecked)) : null;
    const isStale = lastChecked && (Date.now() - new Date(lastChecked).getTime()) > 48 * 60 * 60 * 1000;
    const hasChanges = (competitor.changes_count ?? 0) > 0;

    return (
        <Link
            href={route('competitors.show', competitor.id)}
            className="glass-card group flex items-center gap-4 rounded-xl p-4 transition hover:bg-white/[0.04]"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-sm font-bold text-slate-300 ring-1 ring-white/[0.08]">
                {competitor.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-slate-200 group-hover:text-white">{competitor.name}</p>
                    <span className={`inline-block h-2 w-2 rounded-full ${isStale ? 'bg-yellow-400' : lastChecked ? 'bg-emerald-400' : 'bg-slate-600'}`} title={isStale ? 'Stale — not checked recently' : lastChecked ? 'Healthy' : 'Never checked'} />
                </div>
                <p className="text-sm text-slate-500">{competitor.domain}</p>
            </div>
            <div className="shrink-0 text-right text-xs">
                <p className="text-slate-400">{competitor.active_pages_count ?? 0} pages</p>
                {hasChanges && <p className="mt-0.5 text-purple-400">{competitor.changes_count} changes</p>}
                {timeSince && (
                    <p className={`mt-0.5 ${isStale ? 'text-yellow-400' : 'text-slate-600'}`}>
                        checked {timeSince}
                    </p>
                )}
            </div>
        </Link>
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

function ChangeTimelineItem({ change }) {
    return (
        <Link
            href={route('changes.show', change.id)}
            className="group relative flex gap-3 rounded-xl p-3 transition hover:bg-white/[0.03]"
        >
            <div className="flex flex-col items-center">
                <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${
                    change.significance === 'high' ? 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.4)]' :
                    change.significance === 'medium' ? 'bg-yellow-400' : 'bg-emerald-400'
                }`} />
                <div className="mt-1 w-px flex-1 bg-white/[0.06]" />
            </div>
            <div className="min-w-0 flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">
                            {change.monitored_page?.competitor?.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                            {change.monitored_page?.page_type} &middot; {change.monitored_page?.url}
                        </p>
                    </div>
                    <SignificanceBadge significance={change.significance} />
                </div>
                {change.diff_summary && (
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {change.diff_summary.split('\n')[0]}
                    </p>
                )}
                <p className="mt-1 text-xs text-slate-600">
                    {timeAgo(new Date(change.detected_at))}
                </p>
            </div>
        </Link>
    );
}

const SIGNIFICANCE_FILTERS = ['all', 'high', 'medium', 'low'];

export default function Dashboard({ competitors, recentChanges, stats }) {
    const [sigFilter, setSigFilter] = useState('all');
    const { post: triggerCheck, processing: checkingAll } = useForm();

    const filteredChanges = sigFilter === 'all'
        ? recentChanges
        : recentChanges.filter((c) => c.significance === sigFilter);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="f-display text-xl font-bold leading-tight text-slate-200">Dashboard</h2>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('competitors.index')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-400 transition hover:bg-cyan-500/15"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add competitor
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* Stats row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="Competitors"
                            value={stats.competitors}
                            color="cyan"
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>}
                        />
                        <StatCard
                            label="Pages monitored"
                            value={stats.active_pages}
                            color="emerald"
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>}
                        />
                        <StatCard
                            label="Total changes"
                            value={stats.total_changes}
                            color="purple"
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>}
                        />
                        <StatCard
                            label="Changes this week"
                            value={stats.changes_this_week}
                            color="orange"
                            trend={{ current: stats.changes_this_week, previous: stats.changes_last_week }}
                            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Competitor health overview */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="f-display text-lg font-semibold text-slate-200">Competitor health</h3>
                                <Link
                                    href={route('competitors.index')}
                                    className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                                >
                                    View all &rarr;
                                </Link>
                            </div>

                            {competitors.length === 0 ? (
                                <div className="rounded-xl border-2 border-dashed border-white/[0.1] p-10 text-center">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
                                        <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-slate-300">No competitors yet</p>
                                    <p className="mt-1 text-xs text-slate-500">Start monitoring by adding your first competitor.</p>
                                    <Link
                                        href={route('competitors.index')}
                                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-cyan-400"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add your first competitor
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {competitors.map((c) => (
                                        <CompetitorHealthCard key={c.id} competitor={c} />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Recent changes timeline */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="f-display text-lg font-semibold text-slate-200">Recent changes</h3>
                                <Link
                                    href={route('changes.index')}
                                    className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                                >
                                    View all &rarr;
                                </Link>
                            </div>

                            {/* Significance filter pills */}
                            <div className="mb-4 flex gap-1.5">
                                {SIGNIFICANCE_FILTERS.map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setSigFilter(f)}
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition ${
                                            sigFilter === f
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
                                    <p className="mt-1 text-xs text-slate-500">
                                        {competitors.length === 0
                                            ? 'Add a competitor to start monitoring for changes.'
                                            : 'Changes will appear here as your monitored pages are checked.'}
                                    </p>
                                </div>
                            ) : filteredChanges.length === 0 ? (
                                <div className="rounded-xl border border-white/[0.05] p-8 text-center">
                                    <p className="text-sm text-slate-500">No {sigFilter} significance changes found.</p>
                                </div>
                            ) : (
                                <div className="glass-card rounded-xl px-2 py-1">
                                    {filteredChanges.map((change) => (
                                        <ChangeTimelineItem key={change.id} change={change} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
