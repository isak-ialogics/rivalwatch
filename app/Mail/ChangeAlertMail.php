<?php

namespace App\Mail;

use App\Models\Change;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ChangeAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly Change $change,
    ) {}

    public function envelope(): Envelope
    {
        $competitor = $this->change->monitoredPage->competitor->name ?? 'a competitor';
        return new Envelope(
            subject: "[RivalWatch] {$competitor} page changed",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.change-alert',
        );
    }
}
