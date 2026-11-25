@php($color = $post->categoryModel?->color ?? '#1f7a55')
<article class="card">
    <a class="cover" href="{{ $post->publicUrl() }}" style="--cover: {{ $color }}" tabindex="-1" aria-hidden="true">
        @if ($post->coverUrl())
            <img src="{{ $post->coverUrl() }}" alt="" loading="lazy" width="1200" height="750">
        @else
            <span class="cover-letter">{{ mb_substr($post->title, 0, 1) }}</span>
        @endif
    </a>
    <div class="card-body">
        @if ($post->categoryModel)
            <a class="pill" href="{{ $post->categoryModel->publicUrl() }}" style="--cat: {{ $color }}">{{ $post->category }}</a>
        @endif
        <h3><a href="{{ $post->publicUrl() }}">{{ $post->title }}</a></h3>
        @if (filled($post->excerpt))
            <p>{{ $post->excerpt }}</p>
        @endif
        <div class="byline">
            @if ($post->author)
                <span class="avatar" aria-hidden="true">{{ $post->author->initials() }}</span>
                @if ($post->author->publicUrl())
                    <a href="{{ $post->author->publicUrl() }}">{{ $post->author->name }}</a>
                @else
                    <span>{{ $post->author->name }}</span>
                @endif
            @endif
            <span><time datetime="{{ $post->published_at?->toDateString() }}">{{ $post->published_at?->format('j M Y') }}</time> · {{ $post->readingMinutes() }} min read</span>
        </div>
    </div>
</article>
