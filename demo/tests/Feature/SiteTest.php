<?php

use App\Models\Category;
use App\Models\Document;
use App\Models\Page;
use App\Models\Tag;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('opens on a home page with the newest article featured, the recent ones and the sections', function (): void {
    $newest = Document::query()->published()->latest('published_at')->firstOrFail();

    $this->get('/')
        ->assertOk()
        ->assertSeeInOrder(['Featured', $newest->title, 'Recent articles', 'Why the ferry timetable changed', 'The Sunday dispatch'])
        ->assertSee('Culture')
        ->assertDontSee('A better way to collaborate');
});

it('shows an article with its cover, author, reading time, tags and related articles', function (): void {
    $this->get('/blog/inside-the-harbour-repair-sheds')
        ->assertOk()
        ->assertSee('<meta property="og:type" content="article">', false)
        ->assertSee('/storage/covers/inside-the-harbour-repair-sheds.jpg">', false)
        ->assertSee('"@type":"Article"', false)
        ->assertSee('Ava Wong')
        ->assertSee('min read')
        ->assertSee('#harbour')
        ->assertSeeInOrder(['Read next', 'Why the ferry timetable changed', 'What the night bus drivers know']);
});

it('falls back to articles in the same category when none are related', function (): void {
    $this->get('/blog/a-beginners-guide-to-oral-history')
        ->assertOk()
        ->assertSee('Read next')
        ->assertSee('A field guide to slower mornings');
});

it('hides drafts, articles in review and articles kept from search engines', function (): void {
    Document::query()->where('slug', 'team-planning')->update(['robots_noindex' => true]);

    $this->get('/blog/better-collaboration')->assertNotFound();
    $this->get('/blog/our-newsroom-style-guide-revised')->assertNotFound();
    $this->get('/blog/team-planning')->assertNotFound();
    $this->get('/blog')->assertDontSee('Team planning');
});

it('lists articles by category, tag and author', function (): void {
    $this->get('/category/stories')->assertOk()->assertSee('Long reads about the people')->assertSee('Inside the harbour repair sheds')->assertDontSee('Small farms on rooftop Kowloon');
    $this->get('/tag/harbour')->assertOk()->assertSee('#harbour')->assertSee('Why the ferry timetable changed')->assertDontSee('The last typewriter shop');
    $this->get('/author/mia-kim')->assertOk()->assertSee('Food and culture writer')->assertSee('The libraries that stay open late')->assertDontSee('Team planning');
    $this->get('/category/nothing')->assertNotFound();
});

it('pages through the archive, nine articles at a time', function (): void {
    $this->get('/blog')->assertOk()->assertSee('Page 1 of 2')->assertSee('Older →');
    $this->get('/blog?page=2')->assertOk()->assertSee('Page 2 of 2')->assertSee('← Newer');
});

it('searches titles, summaries and bodies, and keeps search results out of search engines', function (): void {
    $this->get('/blog?q=propeller')
        ->assertOk()
        ->assertSee('Search: “propeller”', false)
        ->assertSee('Inside the harbour repair sheds')
        ->assertDontSee('Small farms on rooftop Kowloon')
        ->assertSee('<meta name="robots" content="noindex">', false);

    $this->get('/blog?q=zzzz')->assertOk()->assertSee('No article mentions');
});

it('shows the static pages edited in the CMS, with their own titles in the navigation', function (): void {
    Page::query()->where('slug', 'about')->firstOrFail()->setTranslation('body', 'en', '<p>A rewritten introduction.</p>')->save();

    $this->get('/about')->assertOk()->assertSee('<title>About Fieldnotes · Fieldnotes</title>', false)->assertSee('A rewritten introduction.');
    $this->get('/terms')->assertOk()->assertSee('Terms of use');
    $this->get('/contact')->assertOk()->assertSeeInOrder(['About Fieldnotes', 'Contact us', 'Privacy', 'Terms of use']);
});

it('answers an unknown address with the blog’s own not-found page', function (): void {
    $this->get('/no-such-page')->assertNotFound()->assertSee('This page has wandered off.')->assertSee('<meta name="robots" content="noindex">', false);
});

it('publishes an RSS feed and a sitemap of what is public', function (): void {
    $feed = $this->get('/feed.xml')->assertOk()->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8');
    $rss = simplexml_load_string((string) $feed->getContent());

    expect($rss->channel->item)->toHaveCount(13)
        ->and((string) $rss->channel->item[0]->link)->toEndWith('/blog/inside-the-harbour-repair-sheds');

    $sitemap = simplexml_load_string((string) $this->get('/sitemap.xml')->assertOk()->getContent());
    $locations = [];

    foreach ($sitemap->url as $url) {
        $locations[] = (string) parse_url((string) $url->loc, PHP_URL_PATH);
    }

    expect($locations)->toContain('/about', '/category/news', '/blog/spring-product-update')
        ->not->toContain('/blog/better-collaboration');
});

it('renames a category on its articles, and adds a tag typed into an article to the list', function (): void {
    Category::query()->where('name', 'Stories')->firstOrFail()->update(['name' => 'Features']);

    expect(Document::query()->where('category', 'Features')->count())->toBe(4)
        ->and(Document::query()->where('category', 'Stories')->count())->toBe(0);

    Document::query()->where('slug', 'team-planning')->firstOrFail()->update(['tags' => ['newsroom', 'Planning Meetings']]);

    expect(Tag::query()->where('name', 'Planning Meetings')->value('slug'))->toBe('planning-meetings');
});

it('offers the three starting sections until editors add their own', function (): void {
    Category::query()->delete();

    expect(Category::options())->toBe(['News' => 'News', 'Guides' => 'Guides', 'Stories' => 'Stories']);
});

it('gives authors a page only once they have a profile address', function (): void {
    $writer = User::query()->where('email', 'editor010@example.test')->firstOrFail();

    expect($writer->publicUrl())->toBeNull();

    $writer->update(['slug' => 'nina-walsh']);

    expect($writer->publicUrl())->toBe(route('blog.author', 'nina-walsh'));
});
