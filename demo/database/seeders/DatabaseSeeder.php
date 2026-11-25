<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Document;
use App\Models\Page;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

/**
 * The Fieldnotes blog: sections, tags, people, articles and static pages, with
 * their covers. Presence is never seeded: it comes from real sessions.
 */
class DatabaseSeeder extends Seeder
{
    private const FIRST_NAMES = ['Ava', 'Noah', 'Mia', 'Leo', 'Zoe', 'Kai', 'Ivy', 'Omar', 'Luna', 'Ezra', 'Nina', 'Hugo', 'Vera', 'Jude', 'Chloe', 'Finn', 'Nora', 'Theo', 'Ruby', 'Ari'];

    private const LAST_NAMES = ['Wong', 'Patel', 'Kim', 'Rossi', 'Silva', 'Cohen', 'Park', 'Diaz', 'Singh', 'Berg', 'Walsh', 'Sato', 'Novak', 'Costa', 'Ali', 'Lau', 'Yip', 'Moreau', 'Haddad'];

    public function run(): void
    {
        $this->pages();
        $this->taxonomy();
        $this->people();
        $this->articles();
    }

    /** Static pages, in English and Chinese. About and Contact are pages 1 and 2. */
    private function pages(): void
    {
        foreach (BlogContent::pages() as $page) {
            Page::query()->updateOrCreate(['slug' => $page['slug']], $page);
        }
    }

    private function taxonomy(): void
    {
        foreach (BlogContent::categories() as $position => $category) {
            Category::query()->updateOrCreate(['slug' => $category['slug']], [...$category, 'position' => $position]);
        }

        foreach (BlogContent::tags() as $name => $description) {
            Tag::query()->updateOrCreate(['name' => $name], ['description' => $description]);
        }
    }

    /** Alice, Bob and Carol, whom the scenarios sign in as, and a hundred editors in all. */
    private function people(): void
    {
        $password = Hash::make('password');

        foreach ([['alice', 'Alice Chen'], ['bob', 'Bob Martinez'], ['carol', 'Carol Okafor']] as [$email, $name]) {
            User::query()->updateOrCreate(['email' => $email.'@example.test'], ['name' => $name, 'password' => $password]);
        }

        for ($i = 0; $i < 97; $i++) {
            $name = self::FIRST_NAMES[$i % count(self::FIRST_NAMES)].' '.self::LAST_NAMES[$i % count(self::LAST_NAMES)];
            User::query()->updateOrCreate(
                ['email' => sprintf('editor%03d@example.test', $i + 1)],
                ['name' => $name, 'password' => $password],
            );
        }

        foreach (BlogContent::authors() as $email => $profile) {
            User::query()->where('email', $email)->update($profile);
        }
    }

    private function articles(): void
    {
        $authors = User::query()->whereIn('email', array_keys(BlogContent::authors()))->pluck('id', 'email');

        foreach (BlogContent::articles() as $index => $article) {
            $published = $article['status'] === 'published';

            Document::query()->updateOrCreate(['slug' => $article['slug']], [
                ...collect($article)->except(['author', 'days_ago'])->all(),
                'author_id' => $authors[$article['author']] ?? null,
                // A few hours apart within a day, so the newest is always first.
                'published_at' => $published ? now()->subDays($article['days_ago'] ?? 0)->subHours(2 + $index) : null,
                'cover_image' => $this->cover($article['slug']),
                'cover_alt' => 'An abstract landscape under a pale sun, in the colours of the '.$article['category'].' section.',
            ]);
        }

        foreach (BlogContent::related() as $slug => $relatedSlugs) {
            $ids = Document::query()->whereIn('slug', $relatedSlugs)->pluck('id', 'slug');

            Document::query()->where('slug', $slug)->firstOrFail()->relatedPosts()->sync(
                collect($relatedSlugs)->values()->mapWithKeys(fn (string $related, int $position): array => [$ids[$related] => ['position' => $position]])->all(),
            );
        }
    }

    /**
     * The article's cover, from database/seeders/covers, copied to the public disk.
     * The covers are drawn by `npm run covers`, so they are free to use.
     */
    private function cover(string $slug): ?string
    {
        $source = __DIR__."/covers/{$slug}.jpg";

        if (! is_file($source)) {
            return null;
        }

        Storage::disk('public')->put("covers/{$slug}.jpg", (string) file_get_contents($source));

        return "covers/{$slug}.jpg";
    }
}
