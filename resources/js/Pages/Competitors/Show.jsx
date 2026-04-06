import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

const PAGE_TYPES = ['homepage', 'pricing', 'features', 'about', 'blog', 'careers', 'generic'];
const FREQUENCIES = ['hourly', 'daily', 'weekly'];

function SignificanceBadge({ significance }) {
    const styles = {
        high: 'bg-red-100 text-red-700',
        medium: 'bg-yellow-100 text-yellow-700',
        low: 'bg-green-100 text-green-700',
    };
    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${styles[significance] ?? 'bg-gray-100 text-gray-600'}`}>
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
        <form onSubmit={submit} className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Add monitored page</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-gray-600">URL</label>
                    <input
                        type="url"
                        value={data.url}
                        onChange={(e) => setData('url', e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="https://acmecorp.com/pricing"
                        required
                    />
                    {errors.url && <p className="mt-1 text-xs text-red-600">{errors.url}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600">Page type</label>
                    <select
                        value={data.page_type}
                        onChange={(e) => setData('page_type', e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        {PAGE_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600">Frequency</label>
                    <select
                        value={data.check_frequency}
                        onChange={(e) => setData('check_frequency', e.target.value)}
                        className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    {processing ? 'Adding...' : 'Add page'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
        <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">{page.page_type}</span>
                    <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-blue-600 hover:underline"
                    >
                        {page.url}
                    </a>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                    {page.check_frequency} · {page.snapshots_count ?? 0} snapshots · {page.changes_count ?? 0} changes
                    {page.last_checked_at && ` · last checked ${new Date(page.last_checked_at).toLocaleDateString()}`}
                </p>
            </div>
            <div className="ml-3 flex shrink-0 items-center gap-2">
                <button
                    onClick={() => checkNow(route('monitored-pages.check-now', page.id))}
                    disabled={processing}
                    className="text-xs font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
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
                    className="text-xs font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
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
                    <Link href={route('competitors.index')} className="text-gray-400 hover:text-gray-600">
                        Competitors
                    </Link>
                    <span className="text-gray-300">/</span>
                    <h2 className="text-xl font-semibold text-gray-800">{competitor.name}</h2>
                </div>
            }
        >
            <Head title={competitor.name} />

            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* Competitor info */}
                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{competitor.name}</h3>
                                <a
                                    href={`https://${competitor.domain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    {competitor.domain}
                                </a>
                                {competitor.notes && (
                                    <p className="mt-2 text-sm text-gray-500">{competitor.notes}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Monitored pages */}
                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-800">
                                Monitored pages ({competitor.monitored_pages?.length ?? 0})
                            </h3>
                            {!showAddPage && (
                                <button
                                    onClick={() => setShowAddPage(true)}
                                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
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
                            <div className="rounded-xl border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
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
                            <h3 className="text-base font-semibold text-gray-800">Recent changes</h3>
                            <Link
                                href={`${route('changes.index')}?competitor=${competitor.id}`}
                                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                                View all →
                            </Link>
                        </div>

                        {recentChanges.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
                                No changes detected yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentChanges.map((change) => (
                                    <Link
                                        key={change.id}
                                        href={route('changes.show', change.id)}
                                        className="block rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {change.monitored_page?.page_type} page changed
                                                </p>
                                                <p className="mt-0.5 truncate text-xs text-gray-500">
                                                    {change.monitored_page?.url}
                                                </p>
                                                {change.diff_summary && (
                                                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                                        {change.diff_summary.split('\n')[0]}
                                                    </p>
                                                )}
                                            </div>
                                            <SignificanceBadge significance={change.significance} />
                                        </div>
                                        <p className="mt-2 text-xs text-gray-400">
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
