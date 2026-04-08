import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const PAGE_TYPES = ['', 'homepage', 'pricing', 'features', 'about', 'blog', 'careers', 'generic'];
const SIGNIFICANCES = ['', 'high', 'medium', 'low'];

function SignificanceBadge({ significance }) {
    const styles = {
        high: 'bg-red-500/20 text-red-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        low: 'bg-emerald-500/20 text-emerald-400',
    };
    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${styles[significance] ?? 'bg-slate-500/20 text-slate-400'}`}>
            {significance ?? 'unknown'}
        </span>
    );
}

export default function ChangesIndex({ changes, competitors, filters }) {
    const [localFilters, setLocalFilters] = useState(filters);

    function applyFilters(newFilters) {
        const updated = { ...localFilters, ...newFilters };
        Object.keys(updated).forEach((k) => {
            if (!updated[k]) delete updated[k];
        });
        setLocalFilters(updated);
        router.get(route('changes.index'), updated, { preserveState: true, replace: true });
    }

    const { data: changeList, links, meta } = changes;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-slate-200">Change feed</h2>}
        >
            <Head title="Change feed" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Filters */}
                    <div className="glass-card flex flex-wrap gap-3 rounded-xl p-4">
                        <select
                            value={localFilters.competitor ?? ''}
                            onChange={(e) => applyFilters({ competitor: e.target.value })}
                            className="rounded-lg border-white/[0.1] bg-white/[0.05] text-sm text-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                        >
                            <option value="">All competitors</option>
                            {competitors.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        <select
                            value={localFilters.page_type ?? ''}
                            onChange={(e) => applyFilters({ page_type: e.target.value })}
                            className="rounded-lg border-white/[0.1] bg-white/[0.05] text-sm text-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                        >
                            <option value="">All page types</option>
                            {PAGE_TYPES.filter(Boolean).map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>

                        <select
                            value={localFilters.significance ?? ''}
                            onChange={(e) => applyFilters({ significance: e.target.value })}
                            className="rounded-lg border-white/[0.1] bg-white/[0.05] text-sm text-slate-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                        >
                            <option value="">All significance</option>
                            {SIGNIFICANCES.filter(Boolean).map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Change list */}
                    {changeList.length === 0 ? (
                        <div className="rounded-xl border-2 border-dashed border-white/[0.1] py-16 text-center">
                            <p className="text-slate-400">No changes detected yet.</p>
                            <p className="mt-1 text-sm text-slate-500">Add competitors and start monitoring to see changes here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {changeList.map((change) => (
                                <Link
                                    key={change.id}
                                    href={route('changes.show', change.id)}
                                    className="glass-card block rounded-xl p-5 transition hover:bg-white/[0.04]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-200">
                                                    {change.monitored_page?.competitor?.name}
                                                </span>
                                                <span className="rounded bg-white/[0.08] px-1.5 py-0.5 text-xs text-slate-400">
                                                    {change.monitored_page?.page_type}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 truncate text-sm text-slate-500">
                                                {change.monitored_page?.url}
                                            </p>
                                            {change.diff_summary && (
                                                <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                                                    {change.diff_summary.split('\n')[0]}
                                                </p>
                                            )}
                                            {change.ai_analysis && (
                                                <p className="mt-1 line-clamp-2 text-xs italic text-slate-500">
                                                    {change.ai_analysis.replace(/^ANALYSIS:\s*/i, '').split('\n')[0]}
                                                </p>
                                            )}
                                        </div>
                                        <SignificanceBadge significance={change.significance} />
                                    </div>
                                    <p className="mt-3 text-xs text-slate-600">
                                        {new Date(change.detected_at).toLocaleString()}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {links && links.length > 3 && (
                        <div className="flex justify-center gap-1">
                            {links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded px-3 py-1.5 text-sm ${
                                        link.active
                                            ? 'bg-cyan-500 text-gray-900'
                                            : link.url
                                            ? 'border border-white/[0.1] text-slate-300 hover:bg-white/[0.05]'
                                            : 'border border-white/[0.05] text-slate-600 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
