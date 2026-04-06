<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Alert;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    public function competitors(): HasMany
    {
        return $this->hasMany(Competitor::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'notifications_enabled',
        'notification_threshold',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at'      => 'datetime',
            'password'               => 'hashed',
            'notifications_enabled'  => 'boolean',
        ];
    }

    /**
     * Check if a change meets this user's notification threshold.
     */
    public function shouldNotifyForSignificance(string $significance): bool
    {
        if (! $this->notifications_enabled) {
            return false;
        }
        return match ($this->notification_threshold ?? 'medium') {
            'all'    => true,
            'medium' => in_array($significance, ['medium', 'high']),
            'high'   => $significance === 'high',
            default  => false,
        };
    }
}
