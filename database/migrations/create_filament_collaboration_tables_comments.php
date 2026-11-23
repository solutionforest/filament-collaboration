<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function getConnection(): ?string
    {
        $connection = config('filament-collaboration.connection');

        return is_string($connection) ? $connection : null;
    }

    public function up(): void
    {
        // Comments on a record, or on one of its fields. Every language of a record shares them.
        Schema::connection($this->getConnection())->create('filament_collaboration_comments', function (Blueprint $table): void {
            $table->id();
            $table->char('room', 64);
            $table->string('field')->nullable();
            $table->text('body');
            $table->string('user_type');
            $table->string('user_id', 64);
            $table->string('user_name');
            $table->text('mentions');
            $table->string('resolved_by')->nullable();
            $table->unsignedBigInteger('resolved_at')->nullable();
            $table->unsignedBigInteger('created_at');
            $table->index(['room', 'created_at'], 'fc_comments_room_index');
        });
    }

    public function down(): void
    {
        Schema::connection($this->getConnection())->dropIfExists('filament_collaboration_comments');
    }
};
