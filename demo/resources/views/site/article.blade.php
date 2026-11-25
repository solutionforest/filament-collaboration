@extends('site.layout')

@php($color = $post->categoryModel?->color ?? '#1f7a55')

@section('title', $post->seoTitle())
@section('description', $post->seoDescription())
@section('image', $post->coverUrl() ?? '')
@section('og_type', 'article')
@if (filled($post->canonical_url))
    @section('canonical', $post->canonical_url)
@endif

@push('head')
    <meta property="article:published_time" content="{{ $post->published_at?->toIso8601String() }}">
    @if ($post->author)
        <meta name="author" content="{{ $post->author->name }}">
    @endif
    @if (filled($post->seo_keywords))
        <meta name="keywords" content="{{ $post->seo_keywords }}">
    @endif
    <script type="application/ld+json">{!! json_encode(array_filter([
        '@context' => 'https://schema.org',
        '@type' => 'Article',
        'headline' => $post->title,
        'description' => $post->seoDescription(),
        'image' => $post->coverUrl(),
        'datePublished' => $post->published_at?->toIso8601String(),
        'dateModified' => $post->updated_at?->toIso8601String(),
        'author' => $post->author ? ['@type' => 'Person', 'name' => $post->author->name] : null,
    ]), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
@endpush

@section('content')
    <article>
        <header class="article-head">
            @if ($post->categoryModel)
                <a class="pill" href="{{ $post->categoryModel->publicUrl() }}" style="--cat: {{ $color }}">{{ $post->category }}</a>
            @endif
            <h1>{{ $post->title }}</h1>
            @if (filled($post->excerpt))
                <p class="standfirst">{{ $post->excerpt }}</p>
            @endif
            <div class="article-meta">
                @if ($post->author)
                    <span class="avatar" aria-hidden="true">{{ $post->author->initials() }}</span>
                    @if ($post->author->publicUrl())
                        <a href="{{ $post->author->publicUrl() }}">{{ $post->author->name }}</a>
                    @else
                        <span>{{ $post->author->name }}</span>
                    @endif
                    <span class="dot"></span>
                @endif
                <time datetime="{{ $post->published_at?->toDateString() }}">{{ $post->published_at?->format('j F Y') }}</time>
                <span class="dot"></span>
                <span>{{ $post->readingMinutes() }} min read</span>
            </div>
        </header>

        <figure class="cover article-cover" style="--cover: {{ $color }}">
            @if ($post->coverUrl())
                <img src="{{ $post->coverUrl() }}" alt="{{ $post->cover_alt }}" width="1600" height="686">
            @else
                <span class="cover-letter">{{ mb_substr($post->title, 0, 1) }}</span>
            @endif
        </figure>

        @if (filled($post->key_points))
            <aside class="key-points">
                <h2>Key points</h2>
                <ul>
                    @foreach ($post->key_points as $point)
                        <li @class(['highlight' => $point['highlight'] ?? false])>{{ $point['point'] ?? '' }}</li>
                    @endforeach
                </ul>
            </aside>
        @endif

        <div class="prose">
            {!! $post->bodyHtml() !!}
        </div>

        @if ($post->tagModels()->isNotEmpty())
            <nav class="tags" aria-label="Tags">
                @foreach ($post->tagModels() as $tag)
                    <a class="tag" href="{{ $tag->publicUrl() }}">#{{ $tag->name }}</a>
                @endforeach
            </nav>
        @endif

        @if ($post->author && filled($post->author->bio))
            <aside class="author-box">
                <span class="avatar large" aria-hidden="true">{{ $post->author->initials() }}</span>
                <div>
                    <strong>{{ $post->author->name }}</strong>
                    @if (filled($post->author->job_title))
                        <span class="eyebrow">{{ $post->author->job_title }}</span>
                    @endif
                    <p>{{ $post->author->bio }}</p>
                    @if ($post->author->publicUrl())
                        <p><a href="{{ $post->author->publicUrl() }}">More from {{ $post->author->name }} →</a></p>
                    @endif
                </div>
            </aside>
        @endif
    </article>

    @if ($related->isNotEmpty())
        <section class="related container" aria-labelledby="related-heading">
            <div class="section-head">
                <h2 id="related-heading">Read next</h2>
                <a href="{{ route('blog.index') }}">All articles →</a>
            </div>
            <div class="cards">
                @foreach ($related as $relatedPost)
                    @include('site.partials.card', ['post' => $relatedPost])
                @endforeach
            </div>
        </section>
    @endif
@endsection
