<?php

use Illuminate\Support\Facades\Broadcast;

// Filament listens here for database notifications once Echo is configured.
// The collaboration package registers its own channel.
Broadcast::channel('App.Models.User.{id}', fn ($user, $id): bool => (int) $user->id === (int) $id);
