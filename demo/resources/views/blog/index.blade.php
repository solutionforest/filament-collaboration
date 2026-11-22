<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Fieldnotes Blog</title>
    <meta name="description" content="A demo newsroom blog powered by the Fieldnotes CMS.">
    <style>
        :root { color-scheme: light; --ink:#17312b; --muted:#5b7169; --line:#d7e3dd; --bg:#f6faf7; --card:#fff; --accent:#1f7a55; }
        * { box-sizing: border-box; }
        body { margin:0; font-family: Georgia, "Times New Roman", serif; background:linear-gradient(180deg,#eef6f1,#f8fbf9 30%,#f8fbf9); color:var(--ink); }
        a { color:var(--accent); text-decoration:none; }
        a:hover { text-decoration:underline; }
        .wrap { max-width: 920px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
        header { display:flex; justify-content:space-between; gap:1rem; align-items:end; margin-bottom:2rem; padding-bottom:1rem; border-bottom:1px solid var(--line); }
        .eyebrow { font-family: system-ui, sans-serif; letter-spacing:.14em; text-transform:uppercase; font-size:.72rem; color:var(--accent); font-weight:700; }
        h1 { margin:.2rem 0 0; font-size:2.2rem; }
        .sub { margin:.4rem 0 0; color:var(--muted); font-family: system-ui, sans-serif; font-size:.95rem; }
        .grid { display:grid; gap:1rem; }
        article { background:var(--card); border:1px solid var(--line); border-radius:1rem; padding:1.25rem 1.35rem; box-shadow:0 8px 24px rgb(23 49 43 / 4%); }
        .meta { font-family: system-ui, sans-serif; color:var(--muted); font-size:.85rem; margin-bottom:.55rem; }
        h2 { margin:0 0 .45rem; font-size:1.45rem; }
        p { margin:0; line-height:1.55; color:var(--muted); }
        .tags { margin-top:.8rem; display:flex; flex-wrap:wrap; gap:.4rem; }
        .tag { font-family: system-ui, sans-serif; font-size:.75rem; border:1px solid var(--line); border-radius:999px; padding:.15rem .55rem; color:var(--muted); }
        footer { margin-top:2rem; font-family: system-ui, sans-serif; color:var(--muted); font-size:.85rem; }
    </style>
</head>
<body>
<div class="wrap">
    <header>
        <div>
            <div class="eyebrow">Fieldnotes</div>
            <h1>Blog</h1>
            <p class="sub">Published articles from the collaborative CMS demo.</p>
        </div>
        <p class="sub"><a href="/admin">Manage in CMS</a></p>
    </header>

    <div class="grid">
        @forelse ($posts as $post)
            <article>
                <div class="meta">
                    {{ $post->category }}
                    · {{ $post->author?->name ?? 'Staff' }}
                    · {{ optional($post->published_at)->timezone(config('app.timezone'))->format('M j, Y') }}
                </div>
                <h2><a href="{{ route('blog.show', $post->slug) }}">{{ $post->title }}</a></h2>
                <p>{{ $post->excerpt ?: 'No summary yet.' }}</p>
                @if (! empty($post->tags))
                    <div class="tags">
                        @foreach ($post->tags as $tag)
                            <span class="tag">{{ $tag }}</span>
                        @endforeach
                    </div>
                @endif
            </article>
        @empty
            <article>
                <h2>No published posts yet</h2>
                <p>Publish an article in the CMS with a slug and publish time to see it here.</p>
            </article>
        @endforelse
    </div>

    <footer>Demo public blog · collaboration features live in /admin</footer>
</div>
</body>
</html>
