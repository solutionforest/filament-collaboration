<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Runs after `create_filament_collaboration_tables`, as migrations run in file name order.
return new class extends Migration
{
    public function getConnection(): ?string
    {
        $connection = config('filament-collaboration.connection');

        return is_string($connection) ? $connection : null;
    }

    public function up(): void
    {
        Schema::connection($this->getConnection())->table('filament_collaboration_participants', function (Blueprint $table): void {
            // Which pushed changes this tab may receive: a hash of the fields it can read and see.
            $table->char('audience', 16)->nullable();
            $table->text('readable')->nullable();
        });
    }

    public function down(): void
    {
        Schema::connection($this->getConnection())->table('filament_collaboration_participants', function (Blueprint $table): void {
            $table->dropColumn(['audience', 'readable']);
        });
    }
};
