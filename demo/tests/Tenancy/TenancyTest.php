<?php

use App\Models\User;
use Tests\Tenancy\Team;
use Tests\Tenancy\TeamUser;
use Tests\Tenancy\TenancyTestCase;

uses(TenancyTestCase::class);

function teamMember(string $name, Team $team): TeamUser
{
    $user = User::factory()->create(['name' => $name]);
    $user->workspace_id = $team->id;
    $user->save();

    return TeamUser::query()->findOrFail($user->id);
}

/** @return array<string, mixed> */
function teamRoom(TeamUser $user, Team $team): array
{
    $html = (string) test()->actingAs($user)->get("/teams/{$team->id}/board")->assertOk()->getContent();

    preg_match('/data-collaboration="([^"]+)"/', $html, $match);

    return json_decode(html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5), true);
}

it('gives every tenant its own rooms and endpoint', function (): void {
    [$red, $blue] = [Team::create(['name' => 'Red']), Team::create(['name' => 'Blue'])];
    [$alice, $bob] = [teamMember('Alice', $red), teamMember('Bob', $blue)];
    [$redRoom, $blueRoom] = [teamRoom($alice, $red), teamRoom($bob, $blue)];

    expect($redRoom['url'])->toEndWith("/teams/{$red->id}/_collaboration/sync");

    $this->actingAs($bob)->postJson($blueRoom['url'], ['token' => $blueRoom['token']])->assertOk();
    $this->actingAs($alice)->postJson($redRoom['url'], ['token' => $redRoom['token']])->assertOk()->assertJsonPath('total', 0);
});

it('refuses a token on another tenant\'s endpoint', function (): void {
    [$red, $blue] = [Team::create(['name' => 'Red']), Team::create(['name' => 'Blue'])];
    $alice = teamMember('Alice', $red);
    $room = teamRoom($alice, $red);

    $this->actingAs($alice)->postJson("/teams/{$blue->id}/_collaboration/sync", ['token' => $room['token']])->assertNotFound();

    $alice->workspace_id = $blue->id;
    $alice->save();

    $this->actingAs($alice)->postJson("/teams/{$blue->id}/_collaboration/sync", ['token' => $room['token']])->assertNotFound();
});
