<?php

namespace App\Http\Controllers;

use App\Jobs\DiscoverPagesJob;
use App\Models\Competitor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompetitorController extends Controller
{
    public function index(Request $request): Response
    {
        $competitors = $request->user()
            ->competitors()
            ->withCount(['monitoredPages', 'monitoredPages as active_pages_count' => function ($q) {
                $q->where('is_active', true);
            }])
            ->withCount(['monitoredPages as changes_count' => function ($q) {
                $q->join('changes', 'monitored_pages.id', '=', 'changes.monitored_page_id');
            }])
            ->latest()
            ->get();

        return Inertia::render('Competitors/Index', [
            'competitors' => $competitors,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'domain' => 'required|string|max:255',
            'notes'  => 'nullable|string|max:1000',
        ]);

        $competitor = $request->user()->competitors()->create($validated);

        // Queue page discovery
        DiscoverPagesJob::dispatch($competitor);

        return redirect()->route('competitors.show', $competitor)
            ->with('success', 'Competitor added! Discovering pages in the background...');
    }

    public function show(Request $request, Competitor $competitor): Response
    {
        $this->authorize('view', $competitor);

        $competitor->load([
            'monitoredPages' => function ($q) {
                $q->withCount('snapshots')->withCount('changes')->orderBy('page_type');
            },
        ]);

        $recentChanges = $competitor->monitoredPages()
            ->with('changes', function ($q) {
                $q->with(['monitoredPage'])
                  ->latest('detected_at')
                  ->limit(5);
            })
            ->get()
            ->pluck('changes')
            ->flatten()
            ->sortByDesc('detected_at')
            ->values()
            ->take(15);

        // Stats for the competitor
        $totalChanges = $competitor->monitoredPages()->withCount('changes')->get()->sum('changes_count');
        $activePagesCount = $competitor->monitoredPages()->where('is_active', true)->count();
        $lastCheckedAt = $competitor->monitoredPages()->max('last_checked_at');

        return Inertia::render('Competitors/Show', [
            'competitor'    => $competitor,
            'recentChanges' => $recentChanges,
            'competitorStats' => [
                'total_changes'    => $totalChanges,
                'active_pages'     => $activePagesCount,
                'total_pages'      => $competitor->monitoredPages->count(),
                'last_checked_at'  => $lastCheckedAt,
            ],
        ]);
    }

    public function update(Request $request, Competitor $competitor): RedirectResponse
    {
        $this->authorize('update', $competitor);

        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'domain' => 'required|string|max:255',
            'notes'  => 'nullable|string|max:1000',
        ]);

        $competitor->update($validated);

        return back()->with('success', 'Competitor updated.');
    }

    public function destroy(Competitor $competitor): RedirectResponse
    {
        $this->authorize('delete', $competitor);

        $competitor->delete();

        return redirect()->route('competitors.index')
            ->with('success', 'Competitor removed.');
    }
}
