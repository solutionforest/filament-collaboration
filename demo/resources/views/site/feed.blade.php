{!! '<'.'?xml version="1.0" encoding="UTF-8"?>' !!}
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>Fieldnotes</title>
        <link>{{ route('home') }}</link>
        <description>Stories, guides and news from the city, written by the people who walk it.</description>
        <language>en</language>
        <atom:link href="{{ route('feed') }}" rel="self" type="application/rss+xml"/>
        @if ($articles->isNotEmpty())
            <lastBuildDate>{{ $articles->first()->published_at?->toRssString() }}</lastBuildDate>
        @endif
        @foreach ($articles as $post)
            <item>
                <title>{{ $post->title }}</title>
                <link>{{ $post->publicUrl() }}</link>
                <guid isPermaLink="true">{{ $post->publicUrl() }}</guid>
                <pubDate>{{ $post->published_at?->toRssString() }}</pubDate>
                @if ($post->author)
                    <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">{{ $post->author->name }}</dc:creator>
                @endif
                <category>{{ $post->category }}</category>
                <description>{{ $post->seoDescription() }}</description>
            </item>
        @endforeach
    </channel>
</rss>
