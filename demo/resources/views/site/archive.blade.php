@extends('site.layout')

@section('title', $title)
@section('description', $description)
@if ($search !== '')
    @section('noindex', 'true')
@endif
@if ($articles->currentPage() > 1)
    @section('canonical', $articles->url($articles->currentPage()))
@endif

@section('content')
    <div class="container">
        <header class="page-head">
            @if ($author)
                <div class="author-head">
                    <span class="avatar large" aria-hidden="true">{{ $author->initials() }}</span>
                    <div>
                        <span class="eyebrow">{{ $eyebrow }}</span>
                        <h1>{{ $title }}</h1>
                    </div>
                </div>
            @else
                <span class="eyebrow">{{ $eyebrow }}</span>
                <h1>{{ $title }}</h1>
            @endif
            <p>{{ $description }}</p>
        </header>

        @if ($articles->isEmpty())
            <p class="empty">
                @if ($search !== '')
                    No article mentions “{{ $search }}” yet. Try another word, or browse <a href="{{ route('blog.index') }}">all articles</a>.
                @else
                    No published articles here yet.
                @endif
            </p>
        @else
            <div class="cards">
                @foreach ($articles as $post)
                    @include('site.partials.card', ['post' => $post])
                @endforeach
            </div>

            @if ($articles->hasPages())
                <nav class="pagination" aria-label="Pages">
                    @if ($articles->onFirstPage())
                        <span>← Newer</span>
                    @else
                        <a href="{{ $articles->previousPageUrl() }}" rel="prev">← Newer</a>
                    @endif
                    <span>Page {{ $articles->currentPage() }} of {{ $articles->lastPage() }}</span>
                    @if ($articles->hasMorePages())
                        <a href="{{ $articles->nextPageUrl() }}" rel="next">Older →</a>
                    @else
                        <span>Older →</span>
                    @endif
                </nav>
            @endif
        @endif
    </div>
@endsection
