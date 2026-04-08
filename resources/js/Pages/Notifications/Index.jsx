import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

function SignificanceBadge({ significance }) {
    const styles = {
        high:   'bg-red-500/20 text-red-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        low:    'bg-emerald-500/20 text-emerald-400',
    };
    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${styles[significance] ?? 'bg-slate-500/20 text-slate-400'}`}>
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
            header={<h2 className="text-xl font-semibold leading-tight text-slate-200">Notifications</h2>}
        >
            <Head title="Notifications" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">

                    {/* Preferences card */}
                    <div className="glass-card rounded-xl p-6">
                        <h3 className="mb-4 text-base font-semibold text-slate-200">Email alert preferences</h3>

                        <form onSubmit={submit} className="space-y-5">
                            {/* Enable/disable toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-300">Enable email alerts</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Receive an email when a competitor page changes.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('notifications_enabled', !data.notifications_enabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        data.notifications_enabled ? 'bg-cyan-500' : 'bg-white/[0.1]'
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
                                <label className="block text-sm font-medium text-slate-300 mb-1">Alert threshold</label>
                                <p className="text-xs text-slate-500 mb-2">Only alert for changes at or above this significance level.</p>
                                <div className="flex gap-3">
                                    {['all', 'medium', 'high'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setData('notification_threshold', opt)}
                                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                                                data.notification_threshold === opt
                                                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                                    : 'border-white/[0.1] text-slate-400 hover:bg-white/[0.05]'
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
                                    className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-cyan-400 disabled:opacity-50"
                                >
                                    Save preferences
                                </button>
                                {recentlySuccessful && (
                                    <span className="text-sm text-emerald-400">Saved!</span>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Notification history */}
                    <div>
                        <h3 className="mb-3 text-base font-semibold text-slate-200">Notification history</h3>

                        {alerts.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed border-white/[0.1] py-14 text-center">
                                <p className="text-slate-400">No email alerts sent yet.</p>
                                <p className="mt-1 text-sm text-slate-500">
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
                                            className="glass-card flex items-center justify-between rounded-xl px-5 py-4 transition hover:bg-white/[0.04]"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-200">{competitor?.name ?? '—'}</span>
                                                    <span className="rounded bg-white/[0.08] px-1.5 py-0.5 text-xs text-slate-400">
                                                        {change?.monitored_page?.page_type}
                                                    </span>
                                                    <SignificanceBadge significance={change?.significance} />
                                                </div>
                                                <p className="mt-0.5 truncate text-sm text-slate-500">
                                                    {change?.monitored_page?.url}
                                                </p>
                                            </div>
                                            <div className="ml-4 shrink-0 text-right">
                                                <p className="text-xs text-slate-500">
                                                    {alert.sent_at ? new Date(alert.sent_at).toLocaleString() : '—'}
                                                </p>
                                                <p className="mt-0.5 text-xs text-cyan-400">Email sent</p>
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
            </div>
        </AuthenticatedLayout>
    );
}
