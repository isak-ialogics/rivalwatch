<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Change extends Model
{
    use HasFactory;

    protected $fillable = [
        'monitored_page_id',
        'snapshot_before_id',
        'snapshot_after_id',
        'change_type',
        'significance',
        'diff_summary',
        'ai_analysis',
        'detected_at',
    ];

    protected function casts(): array
    {
        return [
            'detected_at' => 'datetime',
        ];
    }

    public function monitoredPage(): BelongsTo
    {
        return $this->belongsTo(MonitoredPage::class);
    }

    public function snapshotBefore(): BelongsTo
    {
        return $this->belongsTo(Snapshot::class, 'snapshot_before_id');
    }

    public function snapshotAfter(): BelongsTo
    {
        return $this->belongsTo(Snapshot::class, 'snapshot_after_id');
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }
}
