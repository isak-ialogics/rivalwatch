import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

function SignificanceBadge({ significance }) {
    const styles = {
        high:   'bg-red-100 text-red-700',
        medium: 'bg-yellow-100 text-yellow-700',
        low:    'bg-green-100 text-green-700',
    };
    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${styles[significance] ?? 'bg-gray-100 text-gray-600'}`}>
            {significance ?? 'unknown'}
        </span>
    );
}

export default function NotificationsIndex({ preferences, history }) {
    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        notifications_enabled:  preferences.notifications_enabled,
        notification_threshold: preferences.notification_threshold,
    });

    function submit(e) {
        e.preventDefault();
        patch(route('notifications.update'));
    }

    const { data: alerts, links } = history;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Notifications</h2>}
        >
            <Head title="Notifications" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* Preferences card */}
                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                        <h3 className="mb-4 text-base font-semibold text-gray-900">Email alert preferences</h3>

                        <form onSubmit={submit} className="space-y-5">
                            {/* Enable/disable toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Enable email alerts</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Receive an email when a competitor page changes.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('notifications_enabled', !data.notifications_enabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        data.notifications_enabled ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                            data.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Threshold */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alert threshold</label>
                                <p className="text-xs text-gray-400 mb-2">Only alert for changes at or above this significance level.</p>
                                <div className="flex gap-3">
                                    {['all', 'medium', 'high'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setData('notification_threshold', opt)}
                                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                                                data.notification_threshold === opt
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {opt === 'all' ? 'All changes' : opt === 'medium' ? 'Medium+' : 'High only'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Save preferences
                                </button>
                                {recentlySuccessful && (
                                    <span className="text-sm text-green-600">Saved!</span>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Notification history */}
                    <div>
                        <h3 className="mb-3 text-base font-semibold text-gray-900">Notification history</h3>

                        {alerts.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-gray-200 py-14 text-center">
                                <p className="text-gray-500">No email alerts sent yet.</p>
                                <p className="mt-1 text-sm text-gray-400">
                                    Alerts are sent when changes meet your significance threshold.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {alerts.map((alert) => {
                                    const change = alert.change;
                                    const competitor = change?.monitored_page?.competitor;
                                    return (
                                        <Link
                                            key={alert.id}
                                            href={route('changes.show', change?.id)}
                                            className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{competitor?.name ?? '—'}</span>
                                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                                                        {change?.monitored_page?.page_type}
                                                    </span>
                                                    <SignificanceBadge significance={change?.significance} />
                                                </div>
                                                <p className="mt-0.5 truncate text-sm text-gray-400">
                                                    {change?.monitored_page?.url}
                                                </p>
                                            </div>
                                            <div className="ml-4 shrink-0 text-right">
                                                <p className="text-xs text-gray-400">
                                                    {alert.sent_at ? new Date(alert.sent_at).toLocaleString() : '—'}
                                                </p>
                                                <p className="mt-0.5 text-xs text-blue-600">Email sent</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {links && links.length > 3 && (
                            <div className="mt-4 flex justify-center gap-1">
                                {links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`rounded px-3 py-1.5 text-sm ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : link.url
                                                ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                : 'border border-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
