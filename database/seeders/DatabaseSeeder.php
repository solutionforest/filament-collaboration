<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['alice', 'bob'] as $name) {
            User::query()->updateOrCreate(['email' => "$name@example.test"], [
                'name' => ucfirst($name), 'password' => Hash::make('password'),
            ]);
        }
        Document::query()->firstOrCreate(['title' => 'Team planning']);
    }
}
