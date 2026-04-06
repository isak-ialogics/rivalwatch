<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class WeeklyDigestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        /** @var Collection changes grouped by competitor name */
        public readonly Collection $changesByCompetitor,
        public readonly string $weekLabel,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[RivalWatch] Weekly digest — {$this->weekLabel}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.weekly-digest',
        );
    }
}
