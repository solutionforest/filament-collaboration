<?php

declare(strict_types=1);

namespace App\Filament\Resources\Authors\Pages;

use App\Filament\Resources\Authors\AuthorResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;
use Illuminate\Support\Str;

class ManageAuthors extends ManageRecords
{
    protected static string $resource = AuthorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // A new author signs in after resetting their password; the demo has no invitations.
            CreateAction::make()->mutateDataUsing(fn (array $data): array => [...$data, 'password' => Str::password(24)]),
        ];
    }
}
