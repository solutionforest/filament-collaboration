<?php

use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

it('requires authentication for collaboration endpoints', function (): void {
    $document = Document::create(['title' => 'Test']);
    $this->getJson("/collaboration/documents/{$document->id}/updates")->assertUnauthorized();
    $this->postJson('/collaboration/presence', [])->assertUnauthorized();
});

it('stores document updates independently and returns them in order', function (): void {
    $user = User::factory()->create();
    $one = Document::create(['title' => 'One']);
    $two = Document::create(['title' => 'Two']);
    $this->actingAs($user)->postJson("/collaboration/documents/{$one->id}/updates", ['update' => base64_encode('a')])->assertOk();
    $this->postJson("/collaboration/documents/{$two->id}/updates", ['update' => base64_encode('b')])->assertOk();
    $this->getJson("/collaboration/documents/{$one->id}/updates")->assertOk()->assertJsonCount(1, 'updates')->assertJsonPath('updates.0.update', base64_encode('a'));
    $this->postJson("/collaboration/documents/{$one->id}/updates", ['update' => 'not base64!'])->assertUnprocessable();
});

it('shows fresh presence and prevents another user claiming a tab', function (): void {
    $first = User::factory()->create();
    $second = User::factory()->create();
    $session = (string) Str::uuid();
    $body = ['session_id' => $session, 'page' => 'list'];
    $this->actingAs($first)->postJson('/collaboration/presence', $body)->assertOk()->assertJsonPath('presence.0.name', $first->name);
    $this->actingAs($second)->postJson('/collaboration/presence', $body)->assertForbidden();
    DB::table('collaboration_presence')->update(['seen_at' => now()->subMinute()]);
    $this->postJson('/collaboration/presence', ['session_id' => (string) Str::uuid(), 'page' => 'create'])->assertJsonCount(1, 'presence');
});
