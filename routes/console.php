<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run hourly checks every hour
Schedule::command('rivalwatch:monitor --frequency=hourly')->hourly();

// Run daily checks once a day
Schedule::command('rivalwatch:monitor --frequency=daily')->dailyAt('02:00');

// Run weekly checks every Sunday
Schedule::command('rivalwatch:monitor --frequency=weekly')->weekly()->sundays()->at('03:00');
