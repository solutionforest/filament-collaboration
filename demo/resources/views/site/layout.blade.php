@php
    $siteName = 'Fieldnotes';
    $pageTitle = trim($__env->yieldContent('title'));
    $fullTitle = $pageTitle !== '' ? "{$pageTitle} · {$siteName}" : "{$siteName} · Stories, guides and news from the city";
    $description = trim($__env->yieldContent('description')) ?: 'Stories, guides and news from the city, written by the people who walk it.';
    $image = trim($__env->yieldContent('image'));
    $canonical = trim($__env->yieldContent('canonical')) ?: url()->current();
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $fullTitle }}</title>
    <meta name="description" content="{{ $description }}">
    <link rel="canonical" href="{{ $canonical }}">
    @hasSection('noindex')
        <meta name="robots" content="noindex">
    @endif
    <meta property="og:site_name" content="{{ $siteName }}">
    <meta property="og:title" content="{{ $pageTitle !== '' ? $pageTitle : $siteName }}">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:url" content="{{ $canonical }}">
    <meta property="og:type" content="@yield('og_type', 'website')">
    @if ($image !== '')
        <meta property="og:image" content="{{ $image }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:image" content="{{ $image }}">
    @else
        <meta name="twitter:card" content="summary">
    @endif
    <link rel="alternate" type="application/rss+xml" title="{{ $siteName }}" href="{{ route('feed') }}">
    <link rel="stylesheet" href="{{ asset('css/site.css') }}">
    @stack('head')
</head>
<body>
<a class="skip" href="#content">Skip to content</a>

<header class="site-header">
    <div class="container">
        <a class="brand" href="{{ route('home') }}"><span class="brand-mark" aria-hidden="true">F</span>{{ $siteName }}</a>

        <nav class="site-nav" aria-label="Sections">
            <a href="{{ route('blog.index') }}" @if (request()->routeIs('blog.index')) aria-current="page" @endif>All articles</a>
            @foreach ($siteCategories ?? [] as $navCategory)
                <a href="{{ $navCategory->publicUrl() }}" @if (request()->is('category/'.$navCategory->slug)) aria-current="page" @endif>{{ $navCategory->name }}</a>
            @endforeach
            @foreach (($sitePages ?? collect())->whereIn('slug', ['about']) as $navPage)
                <a href="{{ $navPage->publicUrl() }}" @if (request()->is($navPage->slug)) aria-current="page" @endif>{{ $navPage->title }}</a>
            @endforeach
        </nav>

        <form class="search" role="search" action="{{ route('blog.index') }}" method="get">
            <label for="site-search" class="skip">Search articles</label>
            <input id="site-search" type="search" name="q" value="{{ request()->routeIs('blog.index') ? request('q') : '' }}" placeholder="Search articles">
            <button type="submit">Search</button>
        </form>

        <a class="cms-link" href="{{ url('/admin') }}">Open the CMS →</a>
    </div>
</header>

<main id="content">
    @yield('content')
</main>

<footer class="site-footer">
    <div class="container">
        <div class="footer-grid">
            <div>
                <a class="brand" href="{{ route('home') }}"><span class="brand-mark" aria-hidden="true">F</span>{{ $siteName }}</a>
                <p>Stories, guides and news from the city, written and edited together in a collaborative CMS built with Filament.</p>
            </div>
            <div>
                <h2>Sections</h2>
                <ul>
                    @foreach ($siteCategories ?? [] as $footerCategory)
                        <li><a href="{{ $footerCategory->publicUrl() }}">{{ $footerCategory->name }}</a></li>
                    @endforeach
                </ul>
            </div>
            <div>
                <h2>Fieldnotes</h2>
                <ul>
                    @foreach ($sitePages ?? [] as $footerPage)
                        <li><a href="{{ $footerPage->publicUrl() }}">{{ $footerPage->title }}</a></li>
                    @endforeach
                </ul>
            </div>
            <div>
                <h2>Follow</h2>
                <ul>
                    <li><a href="{{ route('feed') }}">RSS feed</a></li>
                    <li><a href="{{ route('sitemap') }}">Sitemap</a></li>
                    <li><a href="{{ url('/admin') }}">Editors’ CMS</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <span>© {{ now()->year }} Fieldnotes. A demo of solutionforest/filament-collaboration.</span>
            <span>All articles and people are fictional.</span>
        </div>
    </div>
</footer>
</body>
</html>
