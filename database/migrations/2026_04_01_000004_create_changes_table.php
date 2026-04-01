<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('changes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitored_page_id')->constrained()->cascadeOnDelete();
            $table->foreignId('snapshot_before_id')->constrained('snapshots')->cascadeOnDelete();
            $table->foreignId('snapshot_after_id')->constrained('snapshots')->cascadeOnDelete();
            $table->string('change_type');
            $table->string('significance')->default('medium');
            $table->text('diff_summary')->nullable();
            $table->text('ai_analysis')->nullable();
            $table->timestamp('detected_at');
            $table->timestamps();

            $table->index('monitored_page_id');
            $table->index('detected_at');
            $table->index('significance');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('changes');
    }
};
