<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Runs after `create_filament_collaboration_tables_audience`, as migrations run in file name order.
return new class extends Migration
{
    public function getConnection(): ?string
    {
        $connection = config('filament-collaboration.connection');

        return is_string($connection) ? $connection : null;
    }

    public function up(): void
    {
        // Images stored before anybody saved: deleted if no saved record ends up using them.
        Schema::connection($this->getConnection())->create('filament_collaboration_uploads', function (Blueprint $table): void {
            $table->id();
            $table->char('room', 64);
            $table->string('field');
            $table->string('disk', 64);
            $table->text('path');
            $table->unsignedBigInteger('created_at');
            $table->index('room', 'fc_uploads_room_index');
            $table->index('created_at', 'fc_uploads_created_index');
        });
    }

    public function down(): void
    {
        Schema::connection($this->getConnection())->dropIfExists('filament_collaboration_uploads');
    }
};
