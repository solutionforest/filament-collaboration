<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $document->title }} — Article preview</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; color: #1b302b; background: #f6f8f5; font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.6; }
        header { padding: 1rem 6vw; background: #173c30; color: #fff; font-weight: 700; }
        main { max-width: 760px; margin: 3rem auto; padding: 0 1.5rem; }
        .notice { background: #fff5d7; padding: .8rem 1rem; border-radius: .5rem; font-size: .9rem; }
        .meta { margin-top: 2.5rem; text-transform: uppercase; font-size: .8rem; letter-spacing: .08em; color: #477361; }
        h1 { font-size: clamp(2rem, 6vw, 3.5rem); line-height: 1.1; letter-spacing: -.03em; }
        .summary { font-size: 1.2rem; color: #51635d; white-space: pre-wrap; }
    </style>
</head>
<body>
<header>Fieldnotes <span style="font-weight:400;opacity:.7">/ CMS demo</span></header>
<main>
    <p class="notice">Private summary preview · {{ ucfirst($document->status) }}. The shared draft is not published or displayed here until someone saves it.</p>
    <p class="meta">{{ $document->category }} · {{ $document->updated_at?->format('M j, Y') }}</p>
    <h1>{{ $document->title }}</h1>
    <p class="summary">{{ $document->excerpt ?: 'No summary has been added yet.' }}</p>
    <p><a href="{{ \App\Filament\Resources\Documents\DocumentResource::getUrl('edit', ['record' => $document]) }}">← Back to editor</a></p>
</main>
</body>
</html>
