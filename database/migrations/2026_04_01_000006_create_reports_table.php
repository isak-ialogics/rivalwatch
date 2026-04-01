<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('report_type');
            $table->longText('content');
            $table->timestamp('generated_at');
            $table->timestamps();

            $table->index('user_id');
            $table->index('report_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
