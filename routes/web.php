<?php

use App\Http\Controllers\ChangeController;
use App\Http\Controllers\CompetitorController;
use App\Http\Controllers\MonitoredPageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Models\Change;
use App\Models\MonitoredPage;
use Carbon\Carbon;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        $user = request()->user();
        $now = Carbon::now();
        $weekAgo = $now->copy()->subWeek();
        $twoWeeksAgo = $now->copy()->subWeeks(2);

        $competitors = $user->competitors()
            ->withCount(['monitoredPages', 'monitoredPages as active_pages_count' => function ($q) {
                $q->where('is_active', true);
            }])
            ->withCount(['monitoredPages as changes_count' => function ($q) {
                $q->join('changes', 'monitored_pages.id', '=', 'changes.monitored_page_id');
            }])
            ->withMax('monitoredPages', 'last_checked_at')
            ->latest()
            ->get();

        $recentChanges = Change::query()
            ->whereHas('monitoredPage.competitor', fn ($q) => $q->where('user_id', $user->id))
            ->with(['monitoredPage.competitor'])
            ->latest('detected_at')
            ->limit(10)
            ->get();

        // Trend calculations
        $competitorIds = $competitors->pluck('id');
        $changesThisWeek = Change::whereHas('monitoredPage', fn ($q) => $q->whereIn('competitor_id', $competitorIds))
            ->where('detected_at', '>=', $weekAgo)->count();
        $changesLastWeek = Change::whereHas('monitoredPage', fn ($q) => $q->whereIn('competitor_id', $competitorIds))
            ->whereBetween('detected_at', [$twoWeeksAgo, $weekAgo])->count();
        $totalChanges = Change::whereHas('monitoredPage', fn ($q) => $q->whereIn('competitor_id', $competitorIds))->count();

        $activePages = $user->competitors()
            ->join('monitored_pages', 'competitors.id', '=', 'monitored_pages.competitor_id')
            ->where('monitored_pages.is_active', true)->count();

        return Inertia::render('Dashboard', [
            'competitors'   => $competitors,
            'recentChanges' => $recentChanges,
            'stats' => [
                'competitors'      => $competitors->count(),
                'active_pages'     => $activePages,
                'total_changes'    => $totalChanges,
                'changes_this_week' => $changesThisWeek,
                'changes_last_week' => $changesLastWeek,
            ],
        ]);
    })->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Competitors
    Route::resource('competitors', CompetitorController::class)
        ->only(['index', 'store', 'show', 'update', 'destroy']);

    // Monitored pages (nested under competitors)
    Route::post('/competitors/{competitor}/pages', [MonitoredPageController::class, 'store'])
        ->name('monitored-pages.store');
    Route::patch('/pages/{monitoredPage}', [MonitoredPageController::class, 'update'])
        ->name('monitored-pages.update');
    Route::delete('/pages/{monitoredPage}', [MonitoredPageController::class, 'destroy'])
        ->name('monitored-pages.destroy');
    Route::post('/pages/{monitoredPage}/check', [MonitoredPageController::class, 'checkNow'])
        ->name('monitored-pages.check-now');

    // Changes feed
    Route::get('/changes', [ChangeController::class, 'index'])->name('changes.index');
    Route::get('/changes/{change}', [ChangeController::class, 'show'])->name('changes.show');

    // Notification preferences + history
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications', [NotificationController::class, 'update'])->name('notifications.update');
});

require __DIR__.'/auth.php';
