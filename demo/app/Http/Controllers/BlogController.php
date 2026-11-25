<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Document;
use App\Models\Page;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/** The public Fieldnotes blog: what readers see of the articles and pages edited in the CMS. */
class BlogController extends Controller
{
    private const PER_PAGE = 9;

    public function home(): View
    {
        $latest = $this->published()->limit(7)->get();

        return view('site.home', [
            'featured' => $latest->first(),
            'recent' => $latest->slice(1)->values(),
            'categories' => Category::query()->orderBy('position')->get()->map(fn (Category $category): array => [
                'category' => $category,
                'count' => $this->published()->where('category', $category->name)->count(),
            ]),
        ]);
    }

    public function index(Request $request): View
    {
        $search = trim((string) $request->query('q', ''));
        $query = $this->published();

        if ($search !== '') {
            $query->where(fn (Builder $query) => $query
                ->where('title', 'like', "%{$search}%")
                ->orWhere('excerpt', 'like', "%{$search}%")
                ->orWhere('body_html', 'like', "%{$search}%"));
        }

        return $this->archive(
            title: $search === '' ? 'All articles' : "Search: “{$search}”",
            description: $search === '' ? 'Every story, guide and news piece from the Fieldnotes desk.' : 'Articles that mention “'.$search.'”.',
            articles: $query->paginate(self::PER_PAGE)->withQueryString(),
            eyebrow: $search === '' ? 'Archive' : 'Search',
            search: $search,
        );
    }

    public function show(string $slug): View
    {
        $post = $this->published()
            ->where('slug', $slug)
            ->with(['relatedPosts' => fn ($query) => $query->published()])
            ->firstOrFail();

        $related = $post->relatedPosts->isNotEmpty()
            ? $post->relatedPosts
            : $this->published()->whereKeyNot($post->getKey())->where('category', $post->category)->limit(3)->get();

        return view('site.article', ['post' => $post, 'related' => $related->take(3)]);
    }

    public function category(string $slug): View
    {
        $category = Category::query()->where('slug', $slug)->firstOrFail();

        return $this->archive(
            title: $category->name,
            description: (string) ($category->description ?: "Articles in {$category->name}."),
            articles: $this->published()->where('category', $category->name)->paginate(self::PER_PAGE),
            eyebrow: 'Category',
        );
    }

    public function tag(string $slug): View
    {
        $tag = Tag::query()->where('slug', $slug)->firstOrFail();

        return $this->archive(
            title: "#{$tag->name}",
            description: (string) ($tag->description ?: "Articles tagged {$tag->name}."),
            articles: $this->published()->whereJsonContains('tags', $tag->name)->paginate(self::PER_PAGE),
            eyebrow: 'Tag',
        );
    }

    public function author(string $slug): View
    {
        $author = User::query()->where('slug', $slug)->firstOrFail();

        return $this->archive(
            title: (string) $author->name,
            description: (string) ($author->bio ?: "Articles by {$author->name}."),
            articles: $this->published()->where('author_id', $author->getKey())->paginate(self::PER_PAGE),
            eyebrow: (string) ($author->job_title ?: 'Author'),
            author: $author,
        );
    }

    public function page(string $slug): View
    {
        return view('site.page', ['page' => Page::query()->where('slug', $slug)->firstOrFail()]);
    }

    public function feed(): Response
    {
        return response()
            ->view('site.feed', ['articles' => $this->published()->limit(20)->get()])
            ->header('Content-Type', 'application/rss+xml; charset=UTF-8');
    }

    public function sitemap(): Response
    {
        return response()
            ->view('site.sitemap', [
                'articles' => $this->published()->get(),
                'pages' => Page::query()->orderBy('id')->get(),
                'categories' => Category::query()->orderBy('position')->get(),
            ])
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    /** @return Builder<Document> */
    private function published(): Builder
    {
        return Document::query()
            ->published()
            ->where('robots_noindex', false)
            ->with('author')
            ->orderByDesc('published_at');
    }

    /** @param LengthAwarePaginator<int, Document> $articles */
    private function archive(string $title, string $description, LengthAwarePaginator $articles, string $eyebrow, string $search = '', ?User $author = null): View
    {
        return view('site.archive', compact('title', 'description', 'articles', 'eyebrow', 'search', 'author'));
    }
}
