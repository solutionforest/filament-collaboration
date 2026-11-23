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
        Schema::connection($this->getConnection())->table('filament_collaboration_documents', function (Blueprint $table): void {
            // Who changed each field since it was last saved, for the save's audit.
            $table->longText('contributors')->nullable();
        });
    }

    public function down(): void
    {
        Schema::connection($this->getConnection())->table('filament_collaboration_documents', function (Blueprint $table): void {
            $table->dropColumn('contributors');
        });
    }
};
