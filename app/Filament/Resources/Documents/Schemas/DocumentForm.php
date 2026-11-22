<?php

namespace App\Filament\Resources\Documents\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class DocumentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Article details')
                ->description('Article details are saved separately from the shared draft.')
                ->schema([
                    TextInput::make('title')->required()->maxLength(255),
                    TextInput::make('slug')->label('Proposed URL slug')->maxLength(255)
                        ->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')->helperText('Demo only. Use lowercase words separated by hyphens.'),
                    Select::make('category')->options(['News' => 'News', 'Guides' => 'Guides', 'Stories' => 'Stories'])->default('News')->required(),
                    Select::make('status')->options(['draft' => 'Draft', 'review' => 'In review', 'published' => 'Published'])->default('draft')->required()
                        ->helperText('Demo workflow label only. Shared drafts are not published to the web.'),
                    Textarea::make('excerpt')->label('Summary')->rows(3)->maxLength(500)->columnSpanFull(),
                ])->columns(2),
        ]);
    }
}
