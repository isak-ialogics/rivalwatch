import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function StatCard({ label, value, color = 'blue' }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        purple: 'bg-purple-50 text-purple-700',
    };
    return (
        <div className={`rounded-xl p-5 ${colors[color]}`}>
            <p className="text-sm font-medium opacity-70">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
    );
}

function SignificanceBadge({ significance }) {
    const styles = {
        high: 'bg-red-100 text-red-700',
        medium: 'bg-yellow-100 text-yellow-700',
        low: 'bg-green-100 text-green-700',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${styles[significance] ?? 'bg-gray-100 text-gray-600'}`}>
            {significance}
        </span>
    );
}

export default function Dashboard({ competitors, recentChanges, stats }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>}
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
                                <h3 className="text-lg font-semibold text-gray-800">Competitors</h3>
                                <Link
                                    href={route('competitors.index')}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                >
                                    View all →
                                </Link>
                            </div>

                            {competitors.length === 0 ? (
                                <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                                    <p className="text-gray-500">No competitors yet.</p>
                                    <Link
                                        href={route('competitors.index')}
                                        className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
                                            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{c.name}</p>
                                                <p className="text-sm text-gray-500">{c.domain}</p>
                                            </div>
                                            <div className="text-right text-sm text-gray-500">
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
                                <h3 className="text-lg font-semibold text-gray-800">Recent changes</h3>
                                <Link
                                    href={route('changes.index')}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                >
                                    View all →
                                </Link>
                            </div>

                            {recentChanges.length === 0 ? (
                                <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                                    <p className="text-gray-500">No changes detected yet. Add a competitor to start monitoring.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentChanges.map((change) => (
                                        <Link
                                            key={change.id}
                                            href={route('changes.show', change.id)}
                                            className="block rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-gray-900">
                                                        {change.monitored_page?.competitor?.name}
                                                    </p>
                                                    <p className="truncate text-sm text-gray-500">
                                                        {change.monitored_page?.page_type} · {change.monitored_page?.url}
                                                    </p>
                                                </div>
                                                <SignificanceBadge significance={change.significance} />
                                            </div>
                                            <p className="mt-2 text-xs text-gray-400">
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
