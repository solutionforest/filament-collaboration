<?php

namespace Tests\Tenancy;

use App\Models\User;
use Filament\Models\Contracts\HasTenants;
use Filament\Panel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class TeamUser extends User implements HasTenants
{
    protected $table = 'users';

    public function getTenants(Panel $panel): Collection
    {
        return Team::query()->whereKey($this->workspace_id)->get();
    }

    public function canAccessTenant(Model $tenant): bool
    {
        return (int) $tenant->getKey() === (int) $this->workspace_id;
    }
}
