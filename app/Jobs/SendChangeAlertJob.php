<?php

namespace App\Jobs;

use App\Mail\ChangeAlertMail;
use App\Models\Alert;
use App\Models\Change;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendChangeAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 30;
    public int $tries   = 3;

    public function __construct(
        protected Change $change,
    ) {}

    public function handle(): void
    {
        $this->change->loadMissing(['monitoredPage.competitor.user']);

        $user = $this->change->monitoredPage?->competitor?->user;

        if (! $user instanceof User) {
            return;
        }

        $significance = $this->change->significance ?? 'low';

        if (! $user->shouldNotifyForSignificance($significance)) {
            return;
        }

        // Avoid duplicate alerts for the same change+user
        $alreadySent = Alert::where('user_id', $user->id)
            ->where('change_id', $this->change->id)
            ->where('channel', 'email')
            ->whereNotNull('sent_at')
            ->exists();

        if ($alreadySent) {
            return;
        }

        Mail::to($user->email)->send(new ChangeAlertMail($user, $this->change));

        Alert::updateOrCreate(
            ['user_id' => $user->id, 'change_id' => $this->change->id, 'channel' => 'email'],
            ['sent_at' => now()],
        );
    }
}
