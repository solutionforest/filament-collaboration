<?php

namespace App\Filament\Resources\Documents\Schemas;

use App\Models\Document;
use App\Models\User;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;
use SolutionForest\FilamentCollaboration\Forms\Components\CollaborativeRichEditor;

class DocumentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Article')
                ->description('Ordinary blog fields merge on save. Presence shows who is in which field.')
                ->schema([
                    TextInput::make('title')->required()->maxLength(255)->live(onBlur: true),
                    TextInput::make('slug')->label('URL slug')->maxLength(255)
                        ->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')
                        ->helperText('Public blog URL: /blog/{slug}'),
                    Select::make('author_id')->label('Author')->relationship(
                        name: 'author',
                        titleAttribute: 'name',
                        modifyQueryUsing: fn (Builder $query): Builder => $query->where(
                            'workspace_id',
                            auth()->user() instanceof User ? auth()->user()->workspace_id : null,
                        ),
                    )->searchable()->preload()->default(fn () => auth()->id())
                        ->helperText('Defaults to you on create when left empty.'),
                    Select::make('category')->options([
                        'News' => 'News',
                        'Guides' => 'Guides',
                        'Stories' => 'Stories',
                    ])->default('News')->required(),
                    Select::make('status')->options([
                        'draft' => 'Draft',
                        'review' => 'In review',
                        'published' => 'Published',
                    ])->default('draft')->required()->live(),
                    DateTimePicker::make('published_at')->label('Publish at')
                        ->seconds(false)
                        ->helperText('Required for the public blog listing when status is Published.'),
                    TagsInput::make('tags')->placeholder('Add a tag'),
                    TextInput::make('featured_image_url')->label('Featured image URL')->url()->maxLength(2048)->columnSpanFull(),
                    Textarea::make('excerpt')->label('Summary / deck')->rows(3)->maxLength(500)->columnSpanFull(),
                    Textarea::make('body_html')->label('Article body (HTML)')
                        ->rows(12)
                        ->helperText('Public blog content. Concurrent edits merge field-by-field on Save — Yjs is not required for this field.')
                        ->columnSpanFull(),
                ])->columns(2),

            Section::make('SEO')
                ->description('Typical blog SEO fields other CMS editors expect.')
                ->schema([
                    TextInput::make('seo_title')->label('Meta title')->maxLength(70)
                        ->helperText('Defaults to the article title when empty.'),
                    Textarea::make('seo_description')->label('Meta description')->rows(3)->maxLength(160),
                    TextInput::make('seo_keywords')->label('Meta keywords')->maxLength(255),
                    TextInput::make('canonical_url')->label('Canonical URL')->url()->maxLength(2048),
                    Toggle::make('robots_noindex')->label('Noindex')->inline(false),
                ])->columns(2)->collapsed(false),

            Section::make('Related posts')
                ->description('Suggest other articles on the public blog page.')
                ->schema([
                    Select::make('relatedPosts')
                        ->label('Related articles')
                        ->multiple()
                        ->relationship(
                            name: 'relatedPosts',
                            titleAttribute: 'title',
                            modifyQueryUsing: function (Builder $query, ?Document $record): Builder {
                                $query->where(
                                    'workspace_id',
                                    auth()->user() instanceof User ? auth()->user()->workspace_id : null,
                                );
                                if ($record?->getKey()) {
                                    $query->whereKeyNot($record->getKey());
                                }

                                return $query;
                            },
                        )
                        ->searchable()
                        ->preload()
                        ->helperText('Saved with the article; order is the selection order.'),
                ]),

            Section::make('Live collaborative draft (optional Yjs)')
                ->description('Only needed when two people type the same rich text at once. Presence, merge-on-save and the public blog work without this.')
                ->schema([
                    CollaborativeRichEditor::make('live_draft')
                        ->label('Live co-writing pad')
                        ->placeholder('Optional: type here together in real time…')
                        ->columnSpanFull(),
                ])
                ->collapsed(),
        ]);
    }
}
