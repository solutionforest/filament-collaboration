@extends('site.layout')

@section('title', $page->title)
@section('description', (string) ($page->summary ?: $page->title))

@section('content')
    <article class="static-page">
        <header class="page-head">
            <span class="eyebrow">Fieldnotes</span>
            <h1>{{ $page->title }}</h1>
            @if (filled($page->summary))
                <p>{{ $page->summary }}</p>
            @endif
        </header>
        <div class="prose">
            {!! $page->bodyHtml() !!}
        </div>
    </article>
@endsection
