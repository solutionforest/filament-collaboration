{{-- Demo-only: identify the signed-in user for the CollaborativeRichEditor queue. --}}
@if (auth()->check())
    <meta name="collaboration-user" content="{{ auth()->id() }}">
@endif
