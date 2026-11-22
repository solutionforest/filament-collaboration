<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $post->seoTitle() }}</title>
    <meta name="description" content="{{ $post->seoDescription() }}">
    @if (filled($post->seo_keywords))
        <meta name="keywords" content="{{ $post->seo_keywords }}">
    @endif
    @if ($post->robots_noindex)
        <meta name="robots" content="noindex,nofollow">
    @endif
    <link rel="canonical" href="{{ $post->canonical_url ?: $post->publicUrl() }}">
    <style>
        :root { color-scheme: light; --ink:#17312b; --muted:#5b7169; --line:#d7e3dd; --accent:#1f7a55; }
        * { box-sizing: border-box; }
        body { margin:0; font-family: Georgia, "Times New Roman", serif; background:#f7fbf8; color:var(--ink); }
        a { color:var(--accent); text-decoration:none; }
        a:hover { text-decoration:underline; }
        .wrap { max-width: 760px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
        .eyebrow { font-family: system-ui, sans-serif; letter-spacing:.14em; text-transform:uppercase; font-size:.72rem; color:var(--accent); font-weight:700; }
        h1 { margin:.35rem 0 .7rem; font-size:2.4rem; line-height:1.15; }
        .meta { font-family: system-ui, sans-serif; color:var(--muted); font-size:.9rem; margin-bottom:1.25rem; }
        .hero { width:100%; border-radius:1rem; border:1px solid var(--line); margin:0 0 1.5rem; }
        .deck { font-size:1.15rem; line-height:1.55; color:var(--muted); margin:0 0 1.5rem; }
        .body { font-size:1.08rem; line-height:1.7; }
        .body p { margin:0 0 1rem; }
        .related { margin-top:2.5rem; padding-top:1.25rem; border-top:1px solid var(--line); }
        .related h2 { font-size:1.2rem; margin:0 0 .8rem; }
        .related ul { margin:0; padding-left:1.1rem; }
        .related li { margin:.35rem 0; }
        .tags { margin-top:1.25rem; display:flex; flex-wrap:wrap; gap:.4rem; }
        .tag { font-family: system-ui, sans-serif; font-size:.75rem; border:1px solid var(--line); border-radius:999px; padding:.15rem .55rem; color:var(--muted); }
        nav { font-family: system-ui, sans-serif; margin-bottom:1.25rem; color:var(--muted); font-size:.9rem; }
    </style>
</head>
<body>
<div class="wrap">
    <nav><a href="{{ route('blog.index') }}">← All posts</a> · <a href="/admin">CMS</a></nav>
    <div class="eyebrow">{{ $post->category }}</div>
    <h1>{{ $post->title }}</h1>
    <div class="meta">
        {{ $post->author?->name ?? 'Staff' }}
        · {{ optional($post->published_at)->timezone(config('app.timezone'))->format('F j, Y') }}
    </div>

    @if (filled($post->featured_image_url))
        <img class="hero" src="{{ $post->featured_image_url }}" alt="">
    @endif

    @if (filled($post->excerpt))
        <p class="deck">{{ $post->excerpt }}</p>
    @endif

    <div class="body">
        {{-- `bodyHtml()` is sanitised by Filament's rich content renderer. --}}
        {!! $post->bodyHtml() ?: '<p>This article has no body yet.</p>' !!}
    </div>

    @if (! empty($post->tags))
        <div class="tags">
            @foreach ($post->tags as $tag)
                <span class="tag">{{ $tag }}</span>
            @endforeach
        </div>
    @endif

    @if ($post->relatedPosts->isNotEmpty())
        <section class="related">
            <h2>Related posts</h2>
            <ul>
                @foreach ($post->relatedPosts as $related)
                    <li><a href="{{ route('blog.show', $related->slug) }}">{{ $related->title }}</a></li>
                @endforeach
            </ul>
        </section>
    @endif
</div>
</body>
</html>
