@if (auth()->check())
    @vite(['resources/css/app.css', 'resources/js/collaboration.js'])
@endif
