<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DiscoveredRival extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_site_id',
        'name',
        'domain',
        'description',
        'similarity',
        'added_as_competitor',
        'competitor_id',
    ];

    protected function casts(): array
    {
        return [
            'added_as_competitor' => 'boolean',
        ];
    }

    public function userSite(): BelongsTo
    {
        return $this->belongsTo(UserSite::class);
    }

    public function competitor(): BelongsTo
    {
        return $this->belongsTo(Competitor::class);
    }
}
