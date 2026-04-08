<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discovered_rivals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_site_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('domain');
            $table->text('description')->nullable();
            $table->string('similarity')->nullable(); // high, medium, low
            $table->boolean('added_as_competitor')->default(false);
            $table->foreignId('competitor_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index('user_site_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discovered_rivals');
    }
};
