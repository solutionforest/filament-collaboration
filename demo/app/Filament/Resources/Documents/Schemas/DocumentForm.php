<?php

namespace App\Filament\Resources\Documents\Schemas;

use App\Models\Document;
use App\Models\User;
use Filament\Forms\Components\Builder as BlockBuilder;
use Filament\Forms\Components\Builder\Block;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;

class DocumentForm
{
    // These are stock Filament fields. The collaboration plugin makes them live.
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(['lg' => 3])
            ->components([
                Group::make([
                    Section::make()->schema([
                        TextInput::make('title')->required()->maxLength(255),
                        Textarea::make('excerpt')->label('Summary')->rows(2)->maxLength(500),
                        RichEditor::make('body_html')
                            ->label('Article')
                            ->fileAttachmentsDirectory('articles')
                            ->toolbarButtons([
                                ['bold', 'italic', 'underline', 'strike', 'link'],
                                ['h2', 'h3'],
                                ['blockquote', 'bulletList', 'orderedList', 'table', 'attachFiles'],
                                ['undo', 'redo'],
                            ])
                            ->extraInputAttributes(['style' => 'min-height: 22rem']),
                    ]),
                    Section::make('Key points')
                        ->description('Shown above the article. Add, reorder and edit them together.')
                        ->schema([
                            Repeater::make('key_points')
                                ->hiddenLabel()
                                ->schema([
                                    TextInput::make('point')->required()->maxLength(200),
                                    Toggle::make('highlight')->inline(false),
                                ])
                                ->columns(['md' => 4])
                                ->itemLabel(fn (array $state): ?string => is_string($state['point'] ?? null) ? $state['point'] : null)
                                ->addActionLabel('Add key point')
                                ->defaultItems(0)
                                ->collapsible(),
                        ]),
                    Section::make('Sidebar')
                        ->schema([
                            BlockBuilder::make('sidebar')
                                ->hiddenLabel()
                                ->blocks([
                                    Block::make('quote')->schema([
                                        Textarea::make('text')->rows(2)->required(),
                                        TextInput::make('author'),
                                    ]),
                                    Block::make('link')->schema([
                                        TextInput::make('label')->required(),
                                        TextInput::make('url')->url()->required(),
                                    ]),
                                ])
                                ->addActionLabel('Add to sidebar'),
                        ]),
                    Section::make('SEO')
                        ->schema([
                            TextInput::make('seo_title')->label('Meta title')->maxLength(70)
                                ->helperText('The article title is used when empty.'),
                            TextInput::make('seo_keywords')->label('Meta keywords')->maxLength(255),
                            Textarea::make('seo_description')->label('Meta description')->rows(2)->maxLength(160)->columnSpanFull(),
                            TextInput::make('canonical_url')->label('Canonical URL')->url()->maxLength(2048),
                            Toggle::make('robots_noindex')->label('Hide from search engines')->inline(false),
                        ])
                        ->columns(2),
                ])->columnSpan(['lg' => 2]),

                Group::make([
                    Section::make('Publishing')->schema([
                        Select::make('status')->options([
                            'draft' => 'Draft',
                            'review' => 'In review',
                            'published' => 'Published',
                        ])->default('draft')->required(),
                        DateTimePicker::make('published_at')->label('Publish at')->seconds(false),
                        TextInput::make('slug')->label('URL slug')->maxLength(255)
                            ->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/'),
                        Select::make('author_id')->label('Author')->relationship(
                            name: 'author',
                            titleAttribute: 'name',
                            modifyQueryUsing: fn (Builder $query): Builder => $query->where('workspace_id', self::workspace()),
                        )->searchable()->preload()->default(fn () => auth()->id()),
                    ]),
                    Section::make('Discovery')->schema([
                        Select::make('category')->options([
                            'News' => 'News',
                            'Guides' => 'Guides',
                            'Stories' => 'Stories',
                        ])->default('News')->required(),
                        TagsInput::make('tags')->placeholder('Add a tag'),
                        TextInput::make('featured_image_url')->label('Featured image URL')->url()->maxLength(2048),
                        Select::make('relatedPosts')
                            ->label('Related posts')
                            ->multiple()
                            ->relationship(
                                name: 'relatedPosts',
                                titleAttribute: 'title',
                                modifyQueryUsing: function (Builder $query, ?Document $record): Builder {
                                    $query->where('documents.workspace_id', self::workspace());

                                    if ($record?->getKey()) {
                                        $query->whereKeyNot($record->getKey());
                                    }

                                    return $query;
                                },
                            )
                            ->searchable()
                            ->preload()
                            // Scoped to the workspace, which everybody in the room shares.
                            ->collaborative(),
                    ]),
                ])->columnSpan(['lg' => 1]),
            ]);
    }

    private static function workspace(): ?int
    {
        $user = auth()->user();

        return $user instanceof User ? $user->workspace_id : null;
    }
}
