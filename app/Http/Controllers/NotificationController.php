<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Show notification preferences and history.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $history = Alert::where('user_id', $user->id)
            ->with(['change.monitoredPage.competitor'])
            ->whereNotNull('sent_at')
            ->latest('sent_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Notifications/Index', [
            'preferences' => [
                'notifications_enabled'  => $user->notifications_enabled ?? true,
                'notification_threshold' => $user->notification_threshold ?? 'medium',
            ],
            'history' => $history,
        ]);
    }

    /**
     * Update notification preferences.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'notifications_enabled'  => ['required', 'boolean'],
            'notification_threshold' => ['required', 'in:all,medium,high'],
        ]);

        $request->user()->update($validated);

        return back()->with('status', 'Preferences saved.');
    }
}
