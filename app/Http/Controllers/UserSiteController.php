<?php

namespace App\Http\Controllers;

use App\Jobs\DiscoverRivalsJob;
use App\Models\DiscoveredRival;
use App\Models\UserSite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserSiteController extends Controller
{
    public function index(Request $request): Response
    {
        $sites = $request->user()
            ->userSites()
            ->withCount('discoveredRivals')
            ->latest()
            ->get();

        return Inertia::render('MySites/Index', [
            'sites' => $sites,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'url' => 'required|string|max:255|url:http,https',
        ]);

        $site = $request->user()->userSites()->create([
            'url'    => $validated['url'],
            'status' => 'pending',
        ]);

        // Auto-start discovery
        DiscoverRivalsJob::dispatch($site);

        return redirect()->route('my-sites.show', $site)
            ->with('success', 'Site added! Discovering competitors in the background...');
    }

    public function show(Request $request, UserSite $userSite): Response
    {
        $this->authorize('view', $userSite);

        $userSite->load(['discoveredRivals' => function ($q) {
            $q->orderByRaw("CASE similarity WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END");
        }]);

        // Get user's existing competitor domains to check for duplicates
        $existingDomains = $request->user()->competitors()->pluck('domain')->map(fn ($d) => strtolower(trim($d)))->toArray();

        return Inertia::render('MySites/Show', [
            'site'            => $userSite,
            'existingDomains' => $existingDomains,
        ]);
    }

    public function destroy(UserSite $userSite): RedirectResponse
    {
        $this->authorize('delete', $userSite);

        $userSite->delete();

        return redirect()->route('my-sites.index')
            ->with('success', 'Site removed.');
    }

    public function discover(UserSite $userSite): RedirectResponse
    {
        $this->authorize('update', $userSite);

        // Clear previous results and re-run discovery
        $userSite->discoveredRivals()->delete();
        $userSite->update(['status' => 'pending']);

        DiscoverRivalsJob::dispatch($userSite);

        return back()->with('success', 'Re-discovering competitors...');
    }

    public function addAsCompetitor(Request $request, UserSite $userSite, DiscoveredRival $discoveredRival): RedirectResponse
    {
        $this->authorize('update', $userSite);

        // Create a new Competitor from the discovered rival
        $competitor = $request->user()->competitors()->create([
            'name'   => $discoveredRival->name,
            'domain' => $discoveredRival->domain,
            'notes'  => $discoveredRival->description,
        ]);

        // Mark the rival as added
        $discoveredRival->update([
            'added_as_competitor' => true,
            'competitor_id'       => $competitor->id,
        ]);

        // Queue page discovery for the new competitor
        \App\Jobs\DiscoverPagesJob::dispatch($competitor);

        return back()->with('success', "{$discoveredRival->name} added as competitor!");
    }
}
