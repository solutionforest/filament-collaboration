<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements FilamentUser
{
    // Properties rather than Laravel 13's #[Fillable] and #[Hidden], so the demo also runs on Laravel 12.
    /** @var list<string> */
    protected $fillable = ['name', 'email', 'password', 'slug', 'job_title', 'bio'];

    /** @var list<string> */
    protected $hidden = ['password', 'remember_token'];

    protected $attributes = ['workspace_id' => 1];

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /** @return HasMany<Document, $this> */
    public function articles(): HasMany
    {
        return $this->hasMany(Document::class, 'author_id');
    }

    /** The author's page on the blog, once they have a slug. */
    public function publicUrl(): ?string
    {
        return filled($this->slug) ? route('blog.author', $this->slug) : null;
    }

    public function initials(): string
    {
        return collect(explode(' ', (string) $this->name))->filter()->take(2)->map(fn (string $part): string => mb_strtoupper(mb_substr($part, 0, 1)))->implode('');
    }

    // The seeded passwords are public, so the demo panel never opens in production.
    public function canAccessPanel(Panel $panel): bool
    {
        return app()->environment('local', 'testing');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'workspace_id' => 'integer',
        ];
    }
}
