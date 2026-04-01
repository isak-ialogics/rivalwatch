<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Snapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'monitored_page_id',
        'screenshot_path',
        'dom_content',
        'text_content',
        'captured_at',
    ];

    protected function casts(): array
    {
        return [
            'captured_at' => 'datetime',
        ];
    }

    public function monitoredPage(): BelongsTo
    {
        return $this->belongsTo(MonitoredPage::class);
    }
}
