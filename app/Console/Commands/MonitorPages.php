<?php

namespace App\Console\Commands;

use App\Jobs\CheckPageJob;
use App\Models\MonitoredPage;
use Illuminate\Console\Command;

class MonitorPages extends Command
{
    protected $signature   = 'rivalwatch:monitor {--frequency= : Filter by frequency (hourly, daily, weekly)}';
    protected $description = 'Queue CheckPageJob for all active monitored pages that are due for a check.';

    public function handle(): int
    {
        $frequency = $this->option('frequency');

        $query = MonitoredPage::query()
            ->where('is_active', true)
            ->when($frequency, fn ($q) => $q->where('check_frequency', $frequency));

        // Dispatch only pages that are due
        $query->each(function (MonitoredPage $page) {
            if ($this->isDue($page)) {
                CheckPageJob::dispatch($page);
                $this->line("Queued: [{$page->page_type}] {$page->url}");
            }
        });

        $this->info('Done dispatching page checks.');
        return self::SUCCESS;
    }

    protected function isDue(MonitoredPage $page): bool
    {
        if ($page->last_checked_at === null) {
            return true;
        }

        $interval = match ($page->check_frequency) {
            'hourly' => 60,        // minutes
            'weekly' => 60 * 24 * 7,
            default  => 60 * 24,   // daily
        };

        return $page->last_checked_at->diffInMinutes(now()) >= $interval;
    }
}
