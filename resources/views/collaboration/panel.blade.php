@if (auth()->check())
    <meta name="collaboration-user" content="{{ auth()->id() }}">
    @vite(['resources/css/app.css', 'resources/js/collaboration.js'])
@endif
