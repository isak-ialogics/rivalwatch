<?php

namespace App\Jobs;

use App\Models\Competitor;
use App\Services\PageDiscoveryService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DiscoverPagesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;
    public int $tries   = 1;

    public function __construct(
        protected Competitor $competitor,
    ) {}

    public function handle(PageDiscoveryService $discoveryService): void
    {
        Log::info("DiscoverPagesJob: discovering pages for competitor {$this->competitor->id} ({$this->competitor->domain})");

        $discovered = $discoveryService->discover($this->competitor->domain);

        foreach ($discovered as $pageData) {
            // Skip if already being monitored
            $exists = $this->competitor->monitoredPages()
                ->where('url', $pageData['url'])
                ->exists();

            if ($exists) {
                continue;
            }

            $page = $this->competitor->monitoredPages()->create([
                'url'             => $pageData['url'],
                'page_type'       => $pageData['page_type'],
                'check_frequency' => 'daily',
                'is_active'       => true,
            ]);

            // Capture initial snapshot
            CheckPageJob::dispatch($page)->delay(now()->addSeconds(5));
        }

        Log::info("DiscoverPagesJob: created " . count($discovered) . " pages for competitor {$this->competitor->id}");
    }
}
