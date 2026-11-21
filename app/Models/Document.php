<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $attributes = ['workspace_id' => 1];

    protected $fillable = ['title', 'workspace_id'];

    protected function casts(): array
    {
        return ['workspace_id' => 'integer', 'revision' => 'integer'];
    }
}
