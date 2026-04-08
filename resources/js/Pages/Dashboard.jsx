import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function StatCard({ label, value, color = 'blue' }) {
    const colors = {
        blue: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };
    return (
        <div className={`rounded-xl border p-5 ${colors[color]}`}>
            <p className="text-sm font-medium opacity-70">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
    );
}

function SignificanceBadge({ significance }) {
    const styles = {
        high: 'bg-red-500/20 text-red-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        low: 'bg-emerald-500/20 text-emerald-400',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${styles[significance] ?? 'bg-slate-500/20 text-slate-400'}`}>
            {significance}
        </span>
    );
}

export default function Dashboard({ competitors, recentChanges, stats }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-slate-200">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatCard label="Competitors tracked" value={stats.competitors} color="blue" />
                        <StatCard label="Pages monitored" value={stats.active_pages} color="green" />
                        <StatCard label="Recent changes" value={stats.total_changes} color="purple" />
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Competitor cards */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-200">Competitors</h3>
                                <Link
                                    href={route('competitors.index')}
                                    className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                                >
                                    View all &rarr;
                                </Link>
                            </div>

                            {competitors.length === 0 ? (
                                <div className="rounded-xl border-2 border-dashed border-white/[0.1] p-8 text-center">
                                    <p className="text-slate-400">No competitors yet.</p>
                                    <Link
                                        href={route('competitors.index')}
                                        className="mt-3 inline-block rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-cyan-400"
                                    >
                                        Add competitor
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {competitors.map((c) => (
                                        <Link
                                            key={c.id}
                                            href={route('competitors.show', c.id)}
                                            className="glass-card flex items-center justify-between rounded-xl p-4 transition hover:bg-white/[0.04]"
                                        >
                                            <div>
                                                <p className="font-medium text-slate-200">{c.name}</p>
                                                <p className="text-sm text-slate-500">{c.domain}</p>
                                            </div>
                                            <div className="text-right text-sm text-slate-500">
                                                <p>{c.active_pages_count ?? 0} pages</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Recent changes */}
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-200">Recent changes</h3>
                                <Link
                                    href={route('changes.index')}
                                    className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                                >
                                    View all &rarr;
                                </Link>
                            </div>

                            {recentChanges.length === 0 ? (
                                <div className="rounded-xl border-2 border-dashed border-white/[0.1] p-8 text-center">
                                    <p className="text-slate-400">No changes detected yet. Add a competitor to start monitoring.</p>
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
                                                    <p className="truncate font-medium text-slate-200">
                                                        {change.monitored_page?.competitor?.name}
                                                    </p>
                                                    <p className="truncate text-sm text-slate-500">
                                                        {change.monitored_page?.page_type} &middot; {change.monitored_page?.url}
                                                    </p>
                                                </div>
                                                <SignificanceBadge significance={change.significance} />
                                            </div>
                                            <p className="mt-2 text-xs text-slate-600">
                                                {new Date(change.detected_at).toLocaleDateString()}
                                            </p>
                                        </Link>
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
