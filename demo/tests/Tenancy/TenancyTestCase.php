<?php

namespace Tests\Tenancy;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

abstract class TenancyTestCase extends TestCase
{
    use RefreshDatabase;

    public function createApplication(): Application
    {
        $app = require __DIR__.'/../../bootstrap/app.php';

        // A second panel, with Filament tenancy, must exist before routes are built.
        $app->booting(fn () => $app->register(TeamPanelProvider::class));
        $app->make(Kernel::class)->bootstrap();

        return $app;
    }

    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('teams', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
        });
    }
}
