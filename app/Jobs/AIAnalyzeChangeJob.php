<?php

namespace App\Jobs;

use App\Models\Change;
use App\Services\AIAnalysisService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AIAnalyzeChangeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 60;
    public int $tries   = 2;

    public function __construct(
        protected Change $change,
    ) {}

    public function handle(AIAnalysisService $aiAnalysisService): void
    {
        $aiAnalysisService->analyse($this->change);

        // Dispatch email alert after analysis so the email includes AI analysis text
        SendChangeAlertJob::dispatch($this->change->fresh());
    }
}
