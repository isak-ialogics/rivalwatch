import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

function AddCompetitorForm({ onCancel }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        domain: '',
        notes: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('competitors.store'), {
            onSuccess: () => { reset(); onCancel(); },
        });
    }

    return (
        <form onSubmit={submit} className="glass-card-cyan rounded-xl p-6">
            <h3 className="mb-4 text-base font-semibold text-slate-200">Add competitor</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-slate-300">Company name</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="mt-1 block w-full rounded-lg border-white/[0.1] bg-white/[0.05] text-slate-200 shadow-sm placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                        placeholder="Acme Corp"
                        required
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300">Domain</label>
                    <input
                        type="text"
                        value={data.domain}
                        onChange={(e) => setData('domain', e.target.value)}
                        className="mt-1 block w-full rounded-lg border-white/[0.1] bg-white/[0.05] text-slate-200 shadow-sm placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                        placeholder="acmecorp.com"
                        required
                    />
                    {errors.domain && <p className="mt-1 text-xs text-red-400">{errors.domain}</p>}
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-300">Notes (optional)</label>
                    <textarea
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        rows={2}
                        className="mt-1 block w-full rounded-lg border-white/[0.1] bg-white/[0.05] text-slate-200 shadow-sm placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                        placeholder="e.g. main competitor in SMB segment"
                    />
                </div>
            </div>
            <div className="mt-4 flex gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-cyan-400 disabled:opacity-60"
                >
                    {processing ? 'Adding...' : 'Add competitor'}
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

export default function CompetitorsIndex({ competitors }) {
    const [showForm, setShowForm] = useState(false);
    const { delete: destroy, processing } = useForm();

    function handleDelete(competitor) {
        if (confirm(`Remove ${competitor.name}? This will delete all monitored pages and snapshots.`)) {
            destroy(route('competitors.destroy', competitor.id));
        }
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-slate-200">Competitors</h2>}
        >
            <Head title="Competitors" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-400">{competitors.length} competitor{competitors.length !== 1 ? 's' : ''} tracked</p>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-cyan-400"
                            >
                                + Add competitor
                            </button>
                        )}
                    </div>

                    {showForm && <AddCompetitorForm onCancel={() => setShowForm(false)} />}

                    {competitors.length === 0 && !showForm ? (
                        <div className="rounded-xl border-2 border-dashed border-white/[0.1] py-16 text-center">
                            <p className="text-lg font-medium text-slate-400">No competitors yet</p>
                            <p className="mt-1 text-sm text-slate-500">Add your first competitor to start monitoring their website.</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-cyan-400"
                            >
                                Add competitor
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {competitors.map((c) => (
                                <div
                                    key={c.id}
                                    className="glass-card flex items-center justify-between rounded-xl p-5"
                                >
                                    <Link href={route('competitors.show', c.id)} className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-200 hover:text-cyan-400">{c.name}</p>
                                        <p className="mt-0.5 text-sm text-slate-500">{c.domain}</p>
                                        <p className="mt-1 text-xs text-slate-600">
                                            {c.monitored_pages_count ?? 0} pages &middot; {c.active_pages_count ?? 0} active
                                        </p>
                                    </Link>
                                    <div className="ml-4 flex items-center gap-3">
                                        <Link
                                            href={route('competitors.show', c.id)}
                                            className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(c)}
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
