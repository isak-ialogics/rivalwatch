import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

function AddSiteForm({ onCancel }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        url: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('my-sites.store'), {
            onSuccess: () => { reset(); onCancel(); },
        });
    }

    return (
        <form onSubmit={submit} className="glass-card-cyan rounded-xl p-6">
            <h3 className="mb-4 text-base font-semibold text-slate-200">Add your site</h3>
            <div>
                <label className="block text-sm font-medium text-slate-300">Website URL</label>
                <input
                    type="url"
                    value={data.url}
                    onChange={(e) => setData('url', e.target.value)}
                    className="mt-1 block w-full rounded-lg border-white/[0.1] bg-white/[0.05] text-slate-200 shadow-sm placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                    placeholder="https://yourcompany.com"
                    required
                />
                {errors.url && <p className="mt-1 text-xs text-red-400">{errors.url}</p>}
            </div>
            <p className="mt-2 text-xs text-slate-500">
                We'll crawl your site, identify your industry, and use AI to discover competing companies.
            </p>
            <div className="mt-4 flex gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-cyan-400 disabled:opacity-60"
                >
                    {processing ? 'Adding...' : 'Find competitors'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-white/[0.1] px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.05]"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

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

export default function MySitesIndex({ sites }) {
    const [showForm, setShowForm] = useState(false);
    const { delete: destroy, processing } = useForm();

    function handleDelete(site) {
        if (confirm('Remove this site and all discovered rivals?')) {
            destroy(route('my-sites.destroy', site.id));
        }
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-slate-200">My Sites</h2>}
        >
            <Head title="My Sites" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            {sites.length} site{sites.length !== 1 ? 's' : ''} analyzed
                        </p>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-cyan-400"
                            >
                                + Add your site
                            </button>
                        )}
                    </div>

                    {showForm && <AddSiteForm onCancel={() => setShowForm(false)} />}

                    {sites.length === 0 && !showForm ? (
                        <div className="rounded-xl border-2 border-dashed border-white/[0.1] py-16 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
                                <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-slate-400">Discover your competitors</p>
                            <p className="mt-1 text-sm text-slate-500">Enter your website URL and we'll use AI to find competing companies.</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-cyan-400"
                            >
                                Add your site
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sites.map((site) => (
                                <div
                                    key={site.id}
                                    className="glass-card flex items-center justify-between rounded-xl p-5"
                                >
                                    <Link href={route('my-sites.show', site.id)} className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3">
                                            <p className="font-semibold text-slate-200 hover:text-cyan-400">{site.url}</p>
                                            <StatusBadge status={site.status} />
                                        </div>
                                        {site.industry && (
                                            <p className="mt-0.5 text-sm text-slate-500">Industry: {site.industry}</p>
                                        )}
                                        <p className="mt-1 text-xs text-slate-600">
                                            {site.discovered_rivals_count ?? 0} rival{(site.discovered_rivals_count ?? 0) !== 1 ? 's' : ''} discovered
                                        </p>
                                    </Link>
                                    <div className="ml-4 flex items-center gap-3">
                                        <Link
                                            href={route('my-sites.show', site.id)}
                                            className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(site)}
                                            disabled={processing}
                                            className="text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
