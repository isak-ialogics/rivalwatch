<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitored_page_id')->constrained()->cascadeOnDelete();
            $table->string('screenshot_path')->nullable();
            $table->longText('dom_content')->nullable();
            $table->longText('text_content')->nullable();
            $table->timestamp('captured_at');
            $table->timestamps();

            $table->index('monitored_page_id');
            $table->index('captured_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('snapshots');
    }
};
