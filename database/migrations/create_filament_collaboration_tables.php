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
        $schema = Schema::connection($this->getConnection());

        $schema->create('filament_collaboration_documents', function (Blueprint $table): void {
            $table->id();
            $table->char('room', 64)->unique();
            $table->unsignedInteger('epoch')->default(1);
            $table->unsignedBigInteger('sequence')->default(0);
            $table->unsignedBigInteger('floor')->default(0);
            $table->unsignedBigInteger('compacted_at_sequence')->default(0);
            $table->unsignedBigInteger('version')->default(0);
            $table->longText('state');
            $table->longText('saved_state');
            $table->longText('saved_hashes');
            $table->text('dirty');
            $table->text('saved_by')->nullable();
            $table->timestamps();
        });

        $schema->create('filament_collaboration_updates', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('document_id')->constrained('filament_collaboration_documents')->cascadeOnDelete();
            $table->unsignedBigInteger('sequence');
            $table->unsignedBigInteger('client');
            $table->longText('operations');
            $table->unique(['document_id', 'sequence'], 'fc_updates_document_sequence_unique');
        });

        $schema->create('filament_collaboration_participants', function (Blueprint $table): void {
            $table->id();
            $table->char('room', 64);
            $table->char('scope', 64)->nullable();
            $table->unsignedBigInteger('client');
            $table->string('user_key', 64);
            $table->string('name');
            $table->text('avatar')->nullable();
            $table->string('mode', 16);
            $table->text('field')->nullable();
            $table->text('cursor')->nullable();
            $table->boolean('idle')->default(false);
            $table->unsignedBigInteger('seen_at');
            $table->unique(['room', 'client'], 'fc_participants_room_client_unique');
            $table->index(['room', 'seen_at'], 'fc_participants_room_seen_index');
            $table->index(['scope', 'seen_at'], 'fc_participants_scope_seen_index');
        });
    }

    public function down(): void
    {
        $schema = Schema::connection($this->getConnection());

        $schema->dropIfExists('filament_collaboration_participants');
        $schema->dropIfExists('filament_collaboration_updates');
        $schema->dropIfExists('filament_collaboration_documents');
    }
};
