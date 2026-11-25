<?php

namespace Tests\MultiPanel;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

abstract class MultiPanelTestCase extends TestCase
{
    use RefreshDatabase;

    public function createApplication(): Application
    {
        $app = require __DIR__.'/../../bootstrap/app.php';

        // The panels and their guard must exist before routes and the broadcast channel are registered.
        $app->booting(function () use ($app): void {
            $app['config']->set('auth.guards.editors', ['driver' => 'session', 'provider' => 'users']);
            $app->register(EditorsPanelProvider::class);
            $app->register(PlainPanelProvider::class);
        });
        $app->make(Kernel::class)->bootstrap();

        return $app;
    }
}
