<?php

namespace App\Http\Controllers;

use App\Jobs\CheckPageJob;
use App\Models\Competitor;
use App\Models\MonitoredPage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MonitoredPageController extends Controller
{
    public function store(Request $request, Competitor $competitor): RedirectResponse
    {
        $this->authorize('update', $competitor);

        $validated = $request->validate([
            'url'             => 'required|url|max:2048',
            'page_type'       => 'required|string|in:homepage,pricing,features,about,blog,careers,generic',
            'check_frequency' => 'required|string|in:hourly,daily,weekly',
        ]);

        $page = $competitor->monitoredPages()->create($validated);

        // Run an initial check immediately
        CheckPageJob::dispatch($page);

        return back()->with('success', 'Page added and initial snapshot queued.');
    }

    public function update(Request $request, MonitoredPage $monitoredPage): RedirectResponse
    {
        $this->authorize('update', $monitoredPage->competitor);

        $validated = $request->validate([
            'check_frequency' => 'required|string|in:hourly,daily,weekly',
            'is_active'       => 'required|boolean',
        ]);

        $monitoredPage->update($validated);

        return back()->with('success', 'Page settings updated.');
    }

    public function destroy(MonitoredPage $monitoredPage): RedirectResponse
    {
        $this->authorize('delete', $monitoredPage->competitor);

        $monitoredPage->delete();

        return back()->with('success', 'Page removed.');
    }

    public function checkNow(MonitoredPage $monitoredPage): RedirectResponse
    {
        $this->authorize('update', $monitoredPage->competitor);

        CheckPageJob::dispatch($monitoredPage);

        return back()->with('success', 'Manual check queued.');
    }
}
