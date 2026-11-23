<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Runs after `create_filament_collaboration_tables_edits`, as migrations run in file name order.
return new class extends Migration
{
    public function getConnection(): ?string
    {
        $connection = config('filament-collaboration.connection');

        return is_string($connection) ? $connection : null;
    }

    public function up(): void
    {
        Schema::connection($this->getConnection())->table('filament_collaboration_documents', function (Blueprint $table): void {
            // A translated record has one draft per language, all in the record's room.
            $table->char('parent_room', 64)->nullable()->index('fc_documents_parent_index');
        });
    }

    public function down(): void
    {
        Schema::connection($this->getConnection())->table('filament_collaboration_documents', function (Blueprint $table): void {
            $table->dropIndex('fc_documents_parent_index');
            $table->dropColumn('parent_room');
        });
    }
};
