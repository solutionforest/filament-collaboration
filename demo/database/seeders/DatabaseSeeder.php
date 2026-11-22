<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use SolutionForest\FilamentCollaboration\Collaboration;
use SolutionForest\FilamentCollaboration\Presence\PresenceStore;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $alice = User::query()->updateOrCreate(['email' => 'alice@example.test'], [
            'name' => 'Alice Chen', 'password' => Hash::make('password'), 'workspace_id' => 1,
        ]);
        $bob = User::query()->updateOrCreate(['email' => 'bob@example.test'], [
            'name' => 'Bob Martinez', 'password' => Hash::make('password'), 'workspace_id' => 1,
        ]);

        $firstNames = ['Ava', 'Noah', 'Mia', 'Leo', 'Zoe', 'Kai', 'Ivy', 'Omar', 'Luna', 'Ezra', 'Nina', 'Hugo', 'Vera', 'Jude', 'Chloe', 'Finn', 'Nora', 'Theo', 'Ruby', 'Ari'];
        $lastNames = ['Ng', 'Patel', 'Kim', 'Rossi', 'Silva', 'Cohen', 'Park', 'Diaz', 'Singh', 'Berg', 'Walsh', 'Sato', 'Novak', 'Costa', 'Ali'];

        $editors = [$alice, $bob];
        for ($i = 1; $i <= 98; $i++) {
            $name = $firstNames[($i - 1) % count($firstNames)].' '.$lastNames[($i - 1) % count($lastNames)];
            if ($i > count($firstNames)) {
                $name .= ' '.$i;
            }
            $editors[] = User::query()->updateOrCreate(['email' => sprintf('editor%03d@example.test', $i)], [
                'name' => $name,
                'password' => Hash::make('password'),
                'workspace_id' => 1,
            ]);
        }

        $articles = [
            [
                'seed' => 'AQOrk9ilBQAHAQdkZWZhdWx0AwlwYXJhZ3JhcGgHAKuT2KUFAAYEAKuT2KUFAVpTdGFydCBoZXJlOiBzaGFyZSB5b3VyIGlkZWFzIGZvciBvdXIgbmV4dCBlZGl0b3JpYWwgcmVsZWFzZS4gV2hhdCBzaG91bGQgd2UgcHVibGlzaCBmaXJzdD8A',
                'title' => 'Team planning',
                'slug' => 'team-planning',
                'category' => 'Guides',
                'status' => 'published',
                'author_id' => $alice->id,
                'excerpt' => 'A practical guide to planning our next editorial release together.',
                'body_html' => "Editors share one planning doc.\n\nUse presence to see who is in SEO, related posts, or the body.",
                'tags' => ['planning', 'newsroom'],
                'seo_title' => 'Team planning for the next release',
                'seo_description' => 'How Fieldnotes editors plan releases together without overwriting each other.',
                'seo_keywords' => 'planning, collaboration, CMS',
                'published_at' => now()->subDays(3),
            ],
            [
                'seed' => 'AQOk3O/tDQAHAQdkZWZhdWx0AwlwYXJhZ3JhcGgHAKTc7+0NAAYEAKTc7+0NAVNHcmVhdCBzdG9yaWVzIGJlZ2luIHdpdGggYSBjb252ZXJzYXRpb24uIEFkZCB5b3VyIHBlcnNwZWN0aXZlIHRvIHRoaXMgc2hhcmVkIGRyYWZ0LgA=',
                'title' => 'A better way to collaborate',
                'slug' => 'better-collaboration',
                'category' => 'Stories',
                'status' => 'draft',
                'author_id' => $bob->id,
                'excerpt' => 'Meet the people and practices behind a more connected newsroom.',
                'body_html' => "Draft story for the features desk.\n\nAlice and Bob can edit different fields at the same time.",
                'tags' => ['culture'],
                'seo_title' => null,
                'seo_description' => null,
                'seo_keywords' => null,
                'published_at' => null,
            ],
            [
                'seed' => 'AQOUn7/NCgAHAQdkZWZhdWx0AwlwYXJhZ3JhcGgHAJSfv80KAAYEAJSfv80KAUtIZXJlIGlzIGEgZmlyc3QgbG9vayBhdCB0aGUgaW1wcm92ZW1lbnRzIG91ciB0ZWFtIGlzIHByZXBhcmluZyB0aGlzIHNlYXNvbi4A',
                'title' => 'Spring product update',
                'slug' => 'spring-product-update',
                'category' => 'News',
                'status' => 'published',
                'author_id' => $alice->id,
                'excerpt' => 'A quick look at what the team has been building this season.',
                'body_html' => "Welcome to the public Fieldnotes blog.\n\nThis post is published so you can open /blog and /blog/spring-product-update without signing in.\n\nIn the CMS, open the same article as Alice and Bob to see who is editing which field.",
                'tags' => ['product', 'release'],
                'seo_title' => 'Spring product update | Fieldnotes',
                'seo_description' => 'What shipped this season in the Fieldnotes collaborative CMS demo.',
                'seo_keywords' => 'product update, spring, Fieldnotes',
                'canonical_url' => null,
                'robots_noindex' => false,
                'published_at' => now()->subDay(),
                'featured_image_url' => 'https://images.unsplash.com/photo-1499750310107-5fefaa4fd47d?auto=format&fit=crop&w=1200&q=80',
            ],
        ];

        for ($n = 1; $n <= 12; $n++) {
            $author = $editors[$n % count($editors)];
            $articles[] = [
                'seed' => null,
                'title' => "Newsroom notebook {$n}",
                'slug' => "newsroom-notebook-{$n}",
                'category' => ['News', 'Guides', 'Stories'][$n % 3],
                'status' => $n % 4 === 0 ? 'published' : ($n % 3 === 0 ? 'review' : 'draft'),
                'author_id' => $author->id,
                'excerpt' => "Seeded article {$n} for load-testing a busy editorial desk.",
                'body_html' => "Notebook entry {$n}.\n\nSeeded so the list stays realistic with many editors online.",
                'tags' => ['seed', 'desk-'.$n],
                'seo_title' => "Newsroom notebook {$n} | Fieldnotes",
                'seo_description' => "Sample SEO description for notebook {$n}.",
                'seo_keywords' => 'seed, notebook, cms',
                'published_at' => $n % 4 === 0 ? now()->subHours($n) : null,
            ];
        }

        $created = [];
        foreach ($articles as $article) {
            $seed = $article['seed'] ?? null;
            unset($article['seed']);
            $document = Document::query()->updateOrCreate(['slug' => $article['slug']], $article);
            $created[$document->slug] = $document;
            if ($seed && ! DB::table('collaboration_updates')->where('document_id', $document->getKey())->exists()) {
                DB::table('collaboration_updates')->insert([
                    'document_id' => $document->getKey(),
                    'update' => $seed,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $spring = $created['spring-product-update'] ?? null;
        $planning = $created['team-planning'] ?? null;
        if ($spring && $planning) {
            $spring->relatedPosts()->sync([$planning->getKey() => ['position' => 0]]);
        }

        if ($spring) {
            $this->seedBusyPresence($spring, $editors);
        }
    }

    /**
     * @param  list<User>  $editors
     */
    private function seedBusyPresence(Document $document, array $editors): void
    {
        $fields = [
            'title', 'slug', 'seo_title', 'seo_description', 'body_html', 'excerpt',
            'tags', 'relatedPosts', 'category', 'status', 'published_at', 'canonical_url',
            'live_draft', 'featured_image_url', 'author_id', 'seo_keywords',
        ];

        $room = PresenceStore::room($document);
        $store = Collaboration::store();
        $now = now();

        DB::table('collaboration_presence')->where('document_id', $document->getKey())->delete();

        foreach ($editors as $index => $editor) {
            $sessionId = (string) Str::uuid();
            $field = $fields[$index % count($fields)];
            DB::table('collaboration_presence')->insert([
                'session_id' => $sessionId,
                'user_id' => $editor->getKey(),
                'document_id' => $document->getKey(),
                'page' => 'edit',
                'focused_field' => $field,
                'seen_at' => $now,
            ]);
            $store->heartbeat($room, 'seed-'.$editor->getKey(), [
                'id' => $editor->getKey(),
                'name' => $editor->name,
                'mode' => 'editing',
                'field' => $field,
                'origin' => 'seed-'.$editor->getKey(),
            ]);
        }
    }
}
