<?php

namespace App\Http\Controllers;

use App\Models\Change;
use App\Models\Competitor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChangeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Change::query()
            ->whereHas('monitoredPage.competitor', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->with(['monitoredPage.competitor'])
            ->latest('detected_at');

        // Filters
        if ($request->filled('competitor')) {
            $query->whereHas('monitoredPage.competitor', function ($q) use ($request) {
                $q->where('id', $request->competitor);
            });
        }

        if ($request->filled('page_type')) {
            $query->whereHas('monitoredPage', function ($q) use ($request) {
                $q->where('page_type', $request->page_type);
            });
        }

        if ($request->filled('significance')) {
            $query->where('significance', $request->significance);
        }

        $changes = $query->paginate(20)->withQueryString();

        $competitors = $request->user()->competitors()->select('id', 'name')->get();

        return Inertia::render('Changes/Index', [
            'changes'     => $changes,
            'competitors' => $competitors,
            'filters'     => $request->only(['competitor', 'page_type', 'significance']),
        ]);
    }

    public function show(Request $request, Change $change): Response
    {
        $this->authorize('view', $change->monitoredPage->competitor);

        $change->load(['monitoredPage.competitor', 'snapshotBefore', 'snapshotAfter']);

        return Inertia::render('Changes/Show', [
            'change' => $change,
        ]);
    }
}
