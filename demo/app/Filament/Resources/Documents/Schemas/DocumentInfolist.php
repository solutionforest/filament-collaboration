<?php

namespace App\Filament\Resources\Documents\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class DocumentInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Article')->schema([
                TextEntry::make('title'),
                TextEntry::make('slug')->placeholder('Not set'),
                TextEntry::make('author.name')->label('Author')->placeholder('Unassigned'),
                TextEntry::make('category')->badge(),
                TextEntry::make('status')->badge(),
                TextEntry::make('published_at')->dateTime()->placeholder('Not scheduled'),
                TextEntry::make('tags')->badge()->separator(',')->placeholder('No tags'),
                ImageEntry::make('cover_image')->label('Cover image')->disk('public')->placeholder('None')->columnSpanFull(),
                TextEntry::make('excerpt')->label('Summary')->placeholder('No summary yet')->columnSpanFull(),
                TextEntry::make('body_html')->label('Body')->html()->placeholder('No body yet')->columnSpanFull(),
                TextEntry::make('updated_at')->label('Last updated')->dateTime(),
            ])->columns(2),
            Section::make('SEO')->schema([
                TextEntry::make('seo_title')->placeholder('Uses article title'),
                TextEntry::make('seo_description')->placeholder('Uses summary'),
                TextEntry::make('seo_keywords')->placeholder('None'),
                TextEntry::make('canonical_url')->placeholder('Default public URL'),
                IconEntry::make('robots_noindex')->boolean()->label('Noindex'),
            ])->columns(2),
            Section::make('Related posts')->schema([
                TextEntry::make('relatedPosts.title')->label('Related')->listWithLineBreaks()->placeholder('None'),
            ]),
        ]);
    }
}
