@extends('site.layout')

@section('description', 'Stories, guides and news from the city, written by the people who walk it.')
@section('image', $featured?->coverUrl() ?? '')

@section('content')
    <section class="hero container">
        <span class="eyebrow">An independent city magazine</span>
        <h1>Notes from the streets, the harbour and the people in between.</h1>
        <p>Fieldnotes is a small newsroom writing slow, careful stories about the city: how it works, who keeps it running, and where to find its quieter corners.</p>
    </section>

    <div class="container">
        @if ($featured)
            @php($featuredColor = $featured->categoryModel?->color ?? '#1f7a55')
            <a class="featured" href="{{ $featured->publicUrl() }}">
                <span class="cover" style="--cover: {{ $featuredColor }}">
                    @if ($featured->coverUrl())
                        <img src="{{ $featured->coverUrl() }}" alt="{{ $featured->cover_alt }}" width="1200" height="750">
                    @else
                        <span class="cover-letter">{{ mb_substr($featured->title, 0, 1) }}</span>
                    @endif
                </span>
                <span class="featured-body">
                    <span class="pill" style="--cat: {{ $featuredColor }}">Featured · {{ $featured->category }}</span>
                    <h2>{{ $featured->title }}</h2>
                    @if (filled($featured->excerpt))
                        <p>{{ $featured->excerpt }}</p>
                    @endif
                    <span class="byline">
                        @if ($featured->author)
                            <span class="avatar" aria-hidden="true">{{ $featured->author->initials() }}</span>
                            <strong>{{ $featured->author->name }}</strong>
                            <span class="dot"></span>
                        @endif
                        <span>{{ $featured->published_at?->format('j M Y') }}</span>
                        <span class="dot"></span>
                        <span>{{ $featured->readingMinutes() }} min read</span>
                    </span>
                </span>
            </a>
        @endif

        <section aria-labelledby="recent-heading">
            <div class="section-head">
                <h2 id="recent-heading">Recent articles</h2>
                <a href="{{ route('blog.index') }}">All articles →</a>
            </div>
            @if ($recent->isEmpty())
                <p class="empty">Nothing else published yet. New articles appear here as soon as an editor publishes them in the CMS.</p>
            @else
                <div class="cards">
                    @foreach ($recent as $post)
                        @include('site.partials.card', ['post' => $post])
                    @endforeach
                </div>
            @endif
        </section>

        @if ($categories->isNotEmpty())
            <section class="topics" aria-label="Sections">
                @foreach ($categories as ['category' => $category, 'count' => $count])
                    <a class="topic" href="{{ $category->publicUrl() }}" style="--cat: {{ $category->color }}">
                        <strong>{{ $category->name }}</strong>
                        <span>{{ $category->description }}</span>
                        <span>· {{ $count }} {{ \Illuminate\Support\Str::plural('article', $count) }}</span>
                    </a>
                @endforeach
            </section>
        @endif

        <section class="newsletter" aria-labelledby="newsletter-heading">
            <div>
                <h2 id="newsletter-heading">The Sunday dispatch</h2>
                <p>One email a week: the best of Fieldnotes, a walk worth taking, and what our editors are reading. No tracking, no noise.</p>
            </div>
            <form action="{{ route('page', 'contact') }}" method="get">
                <label class="skip" for="newsletter-email">Email address</label>
                <input id="newsletter-email" type="email" name="email" placeholder="you@example.com" autocomplete="email">
                <button class="button" type="submit">Subscribe</button>
                <small>This is a demo: nothing is sent. The Contact page explains how to reach the desk.</small>
            </form>
        </section>
    </div>
@endsection
