@extends('site.layout')

@section('title', 'Page not found')
@section('noindex', 'true')

@section('content')
    <section class="not-found container">
        <div class="code">404</div>
        <h1>This page has wandered off.</h1>
        <p>It may have moved, or never existed. Try a search, or start again from the front page.</p>
        <a class="button" href="{{ route('home') }}">Back to Fieldnotes</a>
        <a class="button secondary" href="{{ route('blog.index') }}">All articles</a>
    </section>
@endsection
