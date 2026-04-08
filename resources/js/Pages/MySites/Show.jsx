import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

function StatusBadge({ status }) {
    const styles = {
        pending: 'bg-slate-500/20 text-slate-400',
        discovering: 'bg-yellow-500/20 text-yellow-400',
        completed: 'bg-emerald-500/20 text-emerald-400',
        failed: 'bg-red-500/20 text-red-400',
    };

    const labels = {
        pending: 'Queued',
        discovering: 'Discovering...',
        completed: 'Complete',
        failed: 'Failed',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.pending}`}>
            {status === 'discovering' && (
                <svg className="mr-1 h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {labels[status] || status}
        </span>
    );
}

function SimilarityBadge({ similarity }) {
    const styles = {
        high: 'bg-red-500/20 text-red-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        low: 'bg-emerald-500/20 text-emerald-400',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[similarity] || styles.medium}`}>
            {similarity} similarity
        </span>
    );
}

function RivalCard({ rival, siteId, isExisting }) {
    const { post, processing } = useForm();

    function handleAdd() {
        post(route('my-sites.add-rival', [siteId, rival.id]));
    }

    const alreadyAdded = rival.added_as_competitor;

    return (
        <div className="glass-card rounded-xl p-5">
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-200">{rival.name}</h3>
                        <SimilarityBadge similarity={rival.similarity} />
                    </div>
                    <p className="mt-0.5 text-sm text-cyan-400">{rival.domain}</p>
                    {rival.description && (
                        <p className="mt-2 text-sm text-slate-400">{rival.description}</p>
                    )}
                </div>
                <div className="ml-4 flex-shrink-0">
                    {alreadyAdded ? (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 px-3 py-1.5 text-sm font-medium text-emerald-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Added
                        </span>
                    ) : isExisting ? (
                        <span className="inline-flex items-center rounded-lg border border-slate-500/30 px-3 py-1.5 text-sm font-medium text-slate-500">
                            Already tracked
                        </span>
                    ) : (
                        <button
                            onClick={handleAdd}
                            disabled={processing}
                            className="rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-cyan-400 disabled:opacity-60"
                        >
                            {processing ? 'Adding...' : '+ Add as competitor'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MySitesShow({ site, existingDomains }) {
    const { post: rediscover, processing: rediscovering } = useForm();

    function handleRediscover() {
        rediscover(route('my-sites.discover', site.id));
    }

    const isDiscovering = site.status === 'discovering' || site.status === 'pending';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('my-sites.index')} className="text-slate-500 hover:text-slate-300">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-slate-200">Site Discovery</h2>
                </div>
            }
        >
            <Head title={`Discover Rivals - ${site.url}`} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Site info header */}
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-200">{site.url}</h3>
                                <div className="mt-2 flex items-center gap-3">
                                    <StatusBadge status={site.status} />
                                    {site.industry && (
                                        <span className="text-sm text-slate-400">
                                            Industry: <span className="text-purple-400">{site.industry}</span>
                                        </span>
                                    )}
                                </div>
                                {site.keywords && site.keywords.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {site.keywords.map((kw, i) => (
                                            <span
                                                key={i}
                                                className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-xs text-slate-400 border border-white/[0.07]"
                                            >
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleRediscover}
                                disabled={rediscovering || isDiscovering}
                                className="rounded-lg border border-white/[0.1] px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/[0.05] disabled:opacity-50"
                            >
                                {rediscovering ? 'Re-discovering...' : 'Re-discover'}
                            </button>
                        </div>
                    </div>

                    {/* Discovery in progress */}
                    {isDiscovering && (
                        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6 text-center">
                            <svg className="mx-auto h-8 w-8 animate-spin text-yellow-400" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <p className="mt-3 text-sm font-medium text-yellow-400">Discovering competitors...</p>
                            <p className="mt-1 text-xs text-slate-500">
                                We're crawling your site and using AI to identify rival companies. This may take a minute.
                            </p>
                            <button
                                onClick={() => router.reload()}
                                className="mt-3 text-xs text-cyan-400 hover:text-cyan-300"
                            >
                                Refresh to check progress
                            </button>
                        </div>
                    )}

                    {/* Failed state */}
                    {site.status === 'failed' && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                            <p className="text-sm font-medium text-red-400">Discovery failed</p>
                            <p className="mt-1 text-xs text-slate-500">
                                We couldn't analyze this site. Check the URL and try again.
                            </p>
                        </div>
                    )}

                    {/* Discovered rivals */}
                    {site.status === 'completed' && (
                        <>
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-slate-300">
                                    Discovered Rivals
                                    <span className="ml-2 text-sm font-normal text-slate-500">
                                        ({site.discovered_rivals?.length ?? 0} found)
                                    </span>
                                </h3>
                            </div>

                            {(!site.discovered_rivals || site.discovered_rivals.length === 0) ? (
                                <div className="rounded-xl border-2 border-dashed border-white/[0.1] py-12 text-center">
                                    <p className="text-sm text-slate-500">No rivals discovered. Try re-running discovery.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {site.discovered_rivals.map((rival) => {
                                        const rivalDomain = rival.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
                                        const isExisting = existingDomains.some(d => {
                                            const normalized = d.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
                                            return normalized === rivalDomain;
                                        });
                                        return (
                                            <RivalCard
                                                key={rival.id}
                                                rival={rival}
                                                siteId={site.id}
                                                isExisting={isExisting}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
