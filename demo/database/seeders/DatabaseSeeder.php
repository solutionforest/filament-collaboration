<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/** Editors and articles only. Presence is never seeded: it comes from real sessions. */
class DatabaseSeeder extends Seeder
{
    private const FIRST_NAMES = ['Ava', 'Noah', 'Mia', 'Leo', 'Zoe', 'Kai', 'Ivy', 'Omar', 'Luna', 'Ezra', 'Nina', 'Hugo', 'Vera', 'Jude', 'Chloe', 'Finn', 'Nora', 'Theo', 'Ruby', 'Ari'];

    private const LAST_NAMES = ['Wong', 'Patel', 'Kim', 'Rossi', 'Silva', 'Cohen', 'Park', 'Diaz', 'Singh', 'Berg', 'Walsh', 'Sato', 'Novak', 'Costa', 'Ali', 'Lau', 'Yip', 'Moreau', 'Haddad'];

    private const ARTICLES = [
        ['A field guide to slower mornings', 'Stories', 'review'],
        ['Inside the harbour repair sheds', 'Stories', 'published'],
        ['How we choose what to cover', 'Guides', 'published'],
        ['The libraries that stay open late', 'News', 'draft'],
        ['Planning a city walk with no map', 'Guides', 'draft'],
        ['What the night bus drivers know', 'Stories', 'review'],
        ['Small farms on rooftop Kowloon', 'News', 'published'],
        ['A beginner’s guide to oral history', 'Guides', 'draft'],
        ['The last typewriter shop', 'Stories', 'draft'],
        ['Our newsroom style guide, revised', 'Guides', 'review'],
        ['Why the ferry timetable changed', 'News', 'published'],
        ['Notes from a week without email', 'Stories', 'draft'],
    ];

    public function run(): void
    {
        $password = Hash::make('password');
        $editors = [];

        foreach ([['alice', 'Alice Chen'], ['bob', 'Bob Martinez'], ['carol', 'Carol Okafor']] as [$email, $name]) {
            $editors[] = User::query()->updateOrCreate(['email' => $email.'@example.test'], ['name' => $name, 'password' => $password]);
        }

        for ($i = 0; $i < 97; $i++) {
            $name = self::FIRST_NAMES[$i % count(self::FIRST_NAMES)].' '.self::LAST_NAMES[$i % count(self::LAST_NAMES)];
            $editors[] = User::query()->updateOrCreate(
                ['email' => sprintf('editor%03d@example.test', $i + 1)],
                ['name' => $name, 'password' => $password],
            );
        }

        $planning = $this->article('team-planning', [
            'title' => 'Team planning',
            'category' => 'Guides',
            'status' => 'published',
            'author_id' => $editors[0]->id,
            'excerpt' => 'A practical guide to planning the next editorial release together.',
            'body_html' => '<p>One plan, written by the whole desk.</p><h2>Before the meeting</h2><ul><li><p>Read last week’s notes</p></li><li><p>Add the stories you want to pitch</p></li></ul>',
            'tags' => ['planning', 'newsroom'],
            'published_at' => now()->subDays(3),
        ]);

        $this->article('better-collaboration', [
            'title' => 'A better way to collaborate',
            'category' => 'Stories',
            'status' => 'draft',
            'author_id' => $editors[1]->id,
            'excerpt' => 'The people and habits behind a more connected newsroom.',
            'body_html' => '<p>Great stories begin with a conversation.</p>',
            'tags' => ['culture'],
        ]);

        $spring = $this->article('spring-product-update', [
            'title' => 'Spring product update',
            'category' => 'News',
            'status' => 'published',
            'author_id' => $editors[0]->id,
            'excerpt' => 'A first look at what the team has been building this season.',
            'body_html' => '<h2>What is new this season</h2>'
                .'<p>We rebuilt the reading experience from the first paragraph to the last, so long articles are calmer and quicker to load.</p>'
                .'<p>Editors can now work on the same article at the same time, and see each other while they do it.</p>'
                .'<h3>Coming next</h3>'
                .'<ul><li><p>Reading lists for subscribers</p></li><li><p>Audio versions of long reads</p></li></ul>'
                .'<p>Welcome to the public Fieldnotes blog.</p>',
            'tags' => ['product', 'release'],
            'seo_title' => 'Spring product update | Fieldnotes',
            'seo_description' => 'What shipped this season at Fieldnotes.',
            'seo_keywords' => 'product update, spring',
            'published_at' => now()->subDay(),
        ]);

        foreach (self::ARTICLES as $index => [$title, $category, $status]) {
            $this->article(str($title)->slug()->toString(), [
                'title' => $title,
                'category' => $category,
                'status' => $status,
                'author_id' => $editors[($index + 2) % count($editors)]->id,
                'excerpt' => $title.', reported by the Fieldnotes desk.',
                'body_html' => '<p>Opening paragraph for “'.e($title).'”.</p><p>Add reporting, quotes and context here.</p>',
                'tags' => ['desk'],
                'published_at' => $status === 'published' ? now()->subHours($index + 4) : null,
            ]);
        }

        $spring->relatedPosts()->sync([$planning->getKey() => ['position' => 0]]);
    }

    /** @param array<string, mixed> $attributes */
    private function article(string $slug, array $attributes): Document
    {
        return Document::query()->updateOrCreate(['slug' => $slug], $attributes);
    }
}
