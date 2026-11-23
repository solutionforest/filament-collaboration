<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Runs after `create_filament_collaboration_tables_contributors`, as migrations run in file name order.
return new class extends Migration
{
    public function getConnection(): ?string
    {
        $connection = config('filament-collaboration.connection');

        return is_string($connection) ? $connection : null;
    }

    public function up(): void
    {
        // With `audit()` on: one row per person, field and minute in which they changed it.
        Schema::connection($this->getConnection())->create('filament_collaboration_edits', function (Blueprint $table): void {
            $table->id();
            $table->char('room', 64);
            $table->string('record_type');
            $table->string('record_key', 64);
            $table->string('user_type');
            $table->string('user_id', 64);
            $table->string('user_name');
            $table->string('field');
            $table->unsignedBigInteger('minute');
            $table->unique(['room', 'user_type', 'user_id', 'field', 'minute'], 'fc_edits_unique');
            $table->index(['record_type', 'record_key', 'minute'], 'fc_edits_record_index');
        });
    }

    public function down(): void
    {
        Schema::connection($this->getConnection())->dropIfExists('filament_collaboration_edits');
    }
};
