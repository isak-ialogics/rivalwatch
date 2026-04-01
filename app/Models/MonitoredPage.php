<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MonitoredPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'competitor_id',
        'url',
        'page_type',
        'check_frequency',
        'last_checked_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'last_checked_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function competitor(): BelongsTo
    {
        return $this->belongsTo(Competitor::class);
    }

    public function snapshots(): HasMany
    {
        return $this->hasMany(Snapshot::class);
    }

    public function changes(): HasMany
    {
        return $this->hasMany(Change::class);
    }
}
