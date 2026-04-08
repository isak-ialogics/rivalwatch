<?php

namespace App\Jobs;

use App\Models\UserSite;
use App\Services\RivalDiscoveryService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DiscoverRivalsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 180;
    public int $tries   = 1;

    public function __construct(
        protected UserSite $userSite,
    ) {}

    public function handle(RivalDiscoveryService $discoveryService): void
    {
        Log::info("DiscoverRivalsJob: starting rival discovery for site {$this->userSite->id} ({$this->userSite->url})");

        $this->userSite->update(['status' => 'discovering']);

        try {
            $rivals = $discoveryService->discover($this->userSite);

            foreach ($rivals as $rivalData) {
                $this->userSite->discoveredRivals()->create([
                    'name'        => $rivalData['name'],
                    'domain'      => $rivalData['domain'],
                    'description' => $rivalData['description'] ?? null,
                    'similarity'  => $rivalData['similarity'] ?? 'medium',
                ]);
            }

            $this->userSite->update(['status' => 'completed']);

            Log::info("DiscoverRivalsJob: discovered " . count($rivals) . " rivals for site {$this->userSite->id}");
        } catch (\Exception $e) {
            $this->userSite->update(['status' => 'failed']);
            Log::error("DiscoverRivalsJob: failed for site {$this->userSite->id}: {$e->getMessage()}");
            throw $e;
        }
    }
}
