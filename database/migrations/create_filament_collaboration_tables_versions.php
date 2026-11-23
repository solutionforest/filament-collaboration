<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Runs after `create_filament_collaboration_tables_uploads`, as migrations run in file name order.
return new class extends Migration
{
    public function getConnection(): ?string
    {
        $connection = config('filament-collaboration.connection');

        return is_string($connection) ? $connection : null;
    }

    public function up(): void
    {
        $schema = Schema::connection($this->getConnection());

        // The shared draft as it was: while people edit, every few minutes, and at each save.
        $schema->create('filament_collaboration_versions', function (Blueprint $table): void {
            $table->id();
            $table->char('room', 64);
            $table->string('reason', 16);
            $table->string('user_name')->nullable();
            $table->longText('values');
            $table->unsignedBigInteger('created_at');
            $table->index(['room', 'created_at'], 'fc_versions_room_index');
        });
    }

    public function down(): void
    {
        Schema::connection($this->getConnection())->dropIfExists('filament_collaboration_versions');
    }
};
