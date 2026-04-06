<?php

namespace App\Jobs;

use App\Models\MonitoredPage;
use App\Services\AIAnalysisService;
use App\Services\ChangeDetectionService;
use App\Services\SnapshotService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckPageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;
    public int $tries   = 2;

    public function __construct(
        protected MonitoredPage $page,
    ) {}

    public function handle(
        SnapshotService $snapshotService,
        ChangeDetectionService $changeDetectionService,
        AIAnalysisService $aiAnalysisService,
    ): void {
        if (!$this->page->is_active) {
            return;
        }

        Log::info("CheckPageJob: checking page {$this->page->id} ({$this->page->url})");

        // Capture new snapshot
        $newSnapshot = $snapshotService->capture($this->page);

        // Get the previous snapshot for comparison
        $previousSnapshot = $this->page->snapshots()
            ->where('id', '!=', $newSnapshot->id)
            ->latest('captured_at')
            ->first();

        if ($previousSnapshot) {
            $change = $changeDetectionService->compare($previousSnapshot, $newSnapshot);

            if ($change) {
                // Run AI analysis asynchronously
                AIAnalyzeChangeJob::dispatch($change);
            }
        }

        // Update last_checked_at
        $this->page->update(['last_checked_at' => now()]);
    }
}
