@if (auth()->check())
    <meta name="collaboration-user" content="{{ auth()->id() }}">
    @vite(['resources/css/collaboration.css', 'resources/js/collaboration.js'])
@endif
