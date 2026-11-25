{!! '<'.'?xml version="1.0" encoding="UTF-8"?>' !!}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>{{ route('home') }}</loc><changefreq>daily</changefreq></url>
    <url><loc>{{ route('blog.index') }}</loc><changefreq>daily</changefreq></url>
    @foreach ($categories as $category)
        <url><loc>{{ $category->publicUrl() }}</loc></url>
    @endforeach
    @foreach ($articles as $post)
        <url><loc>{{ $post->publicUrl() }}</loc><lastmod>{{ $post->updated_at?->toDateString() }}</lastmod></url>
    @endforeach
    @foreach ($pages as $page)
        <url><loc>{{ $page->publicUrl() }}</loc><lastmod>{{ $page->updated_at?->toDateString() }}</lastmod></url>
    @endforeach
</urlset>
