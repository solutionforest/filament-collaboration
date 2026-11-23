<?php

// Test tooling only. Signs the seeded editors in for the load test, because the
// login form is, rightly, limited to five attempts a minute per address.
// It refuses to run against anything but the harness's throwaway database.

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Cookie\CookieValuePrefix;
use Illuminate\Session\SessionManager;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;

if (PHP_SAPI !== 'cli') {
    exit(1);
}

require __DIR__.'/../../vendor/autoload.php';

$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$database = (string) config('database.connections.sqlite.database');

if (! $app->environment('local', 'testing') || ! str_starts_with($database, base_path('storage/framework/testing/'))) {
    fwrite(STDERR, "Refusing: this is not the browser harness's database.\n");
    exit(1);
}

$name = (string) config('session.cookie');
$cookies = [];

foreach (User::query()->orderBy('id')->limit((int) ($argv[1] ?? 100))->get() as $user) {
    $session = $app->make(SessionManager::class)->driver();
    $session->setId(null);
    $session->flush();
    $session->start();
    $session->put(Auth::guard('web')->getName(), $user->getAuthIdentifier());
    $session->save();

    $cookies[] = [
        'name' => $user->name,
        'cookie' => $name.'='.rawurlencode(Crypt::encrypt(CookieValuePrefix::create($name, Crypt::getKey()).$session->getId(), false)),
    ];
}

echo json_encode($cookies);
