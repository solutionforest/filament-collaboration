<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
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
        foreach ([
            ['seed' => 'AQOrk9ilBQAHAQdkZWZhdWx0AwlwYXJhZ3JhcGgHAKuT2KUFAAYEAKuT2KUFAVpTdGFydCBoZXJlOiBzaGFyZSB5b3VyIGlkZWFzIGZvciBvdXIgbmV4dCBlZGl0b3JpYWwgcmVsZWFzZS4gV2hhdCBzaG91bGQgd2UgcHVibGlzaCBmaXJzdD8A', 'title' => 'Team planning', 'slug' => 'team-planning', 'category' => 'Guides', 'status' => 'review', 'excerpt' => 'A practical guide to planning our next editorial release together.'],
            ['seed' => 'AQOk3O/tDQAHAQdkZWZhdWx0AwlwYXJhZ3JhcGgHAKTc7+0NAAYEAKTc7+0NAVNHcmVhdCBzdG9yaWVzIGJlZ2luIHdpdGggYSBjb252ZXJzYXRpb24uIEFkZCB5b3VyIHBlcnNwZWN0aXZlIHRvIHRoaXMgc2hhcmVkIGRyYWZ0LgA=', 'title' => 'A better way to collaborate', 'slug' => 'better-collaboration', 'category' => 'Stories', 'status' => 'draft', 'excerpt' => 'Meet the people and practices behind a more connected newsroom.'],
            ['seed' => 'AQOUn7/NCgAHAQdkZWZhdWx0AwlwYXJhZ3JhcGgHAJSfv80KAAYEAJSfv80KAUtIZXJlIGlzIGEgZmlyc3QgbG9vayBhdCB0aGUgaW1wcm92ZW1lbnRzIG91ciB0ZWFtIGlzIHByZXBhcmluZyB0aGlzIHNlYXNvbi4A', 'title' => 'Spring product update', 'slug' => 'spring-product-update', 'category' => 'News', 'status' => 'published', 'excerpt' => 'A quick look at what the team has been building this season.'],
        ] as $article) {
            $seed = $article['seed'];
            unset($article['seed']);
            $document = Document::query()->firstOrCreate(['title' => $article['title']], $article);
            if ($document->wasRecentlyCreated) {
                DB::table('collaboration_updates')->insert([
                    'document_id' => $document->getKey(), 'update' => $seed,
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }
    }
}
