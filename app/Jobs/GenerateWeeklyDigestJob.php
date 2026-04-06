<?php

namespace App\Jobs;

use App\Mail\WeeklyDigestMail;
use App\Models\Change;
use App\Models\Report;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

class GenerateWeeklyDigestJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120;
    public int $tries   = 2;

    public function handle(): void
    {
        $weekStart = Carbon::now()->subWeek()->startOfDay();
        $weekEnd   = Carbon::now()->startOfDay();
        $weekLabel = $weekStart->format('M j') . ' – ' . $weekEnd->subDay()->format('M j, Y');

        User::where('notifications_enabled', true)->chunk(50, function ($users) use ($weekStart, $weekEnd, $weekLabel) {
            foreach ($users as $user) {
                $this->sendDigestForUser($user, $weekStart, $weekEnd, $weekLabel);
            }
        });
    }

    protected function sendDigestForUser(User $user, Carbon $weekStart, Carbon $weekEnd, string $weekLabel): void
    {
        $changes = Change::query()
            ->whereHas('monitoredPage.competitor', fn ($q) => $q->where('user_id', $user->id))
            ->with(['monitoredPage.competitor'])
            ->whereBetween('detected_at', [$weekStart, $weekEnd])
            ->orderByDesc('detected_at')
            ->get();

        // Group by competitor name
        $changesByCompetitor = $changes->groupBy(
            fn ($change) => $change->monitoredPage?->competitor?->name ?? 'Unknown'
        );

        Mail::to($user->email)->send(new WeeklyDigestMail($user, $changesByCompetitor, $weekLabel));

        // Store a record in reports table
        Report::create([
            'user_id'      => $user->id,
            'report_type'  => 'weekly_digest',
            'content'      => json_encode([
                'week_label'        => $weekLabel,
                'total_changes'     => $changes->count(),
                'competitors_count' => $changesByCompetitor->keys()->count(),
            ]),
            'generated_at' => now(),
        ]);
    }
}
