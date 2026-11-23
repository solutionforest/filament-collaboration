<?php

use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Livewire\Livewire;
use SolutionForest\FilamentCollaboration\Actions\CollaborationPanelAction;
use SolutionForest\FilamentCollaboration\Comments\RecordComments;
use SolutionForest\FilamentCollaboration\Events\CommentPosted;
use Tests\TestCase;

function arrangeComments(TestCase $test): void
{
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->stranger = User::factory()->create(['name' => 'Bob', 'workspace_id' => 2]);
    $test->article = Document::create(['title' => 'First', 'excerpt' => 'Summary']);
}

function commentsPage(TestCase $test, User $user): mixed
{
    $test->actingAs($user);

    return Livewire::test(EditDocument::class, ['record' => $test->article->id]);
}

it('posts a comment on a field, and shows it in the panel', function (): void {
    arrangeComments($this);

    $page = commentsPage($this, $this->alice)->call('postCollaborationComment', 'Shorter, please?', 'title');
    $comments = $page->instance()->getCollaborationComments();

    expect($comments)->toHaveCount(1)
        ->and($comments[0])->toMatchArray(['field' => 'title', 'body' => 'Shorter, please?', 'authorName' => 'Alice Chen'])
        ->and(view('filament-collaboration::panel', ['page' => $page->instance()])->render())->toContain('Shorter, please?')->toContain('Title');
});

it('notifies the people it mentions, and only colleagues can be mentioned', function (): void {
    arrangeComments($this);
    Event::fake([CommentPosted::class]);

    commentsPage($this, $this->alice)->call('postCollaborationComment', '@Bob Martinez can you check this? Not @Bob, the other one.');

    $comment = app(RecordComments::class)->list(DB::table('filament_collaboration_comments')->value('room'))[0];

    expect(array_map(fn ($mention) => $mention->name, $comment->mentions))->toBe(['Bob Martinez'])
        ->and($comment->html())->toContain('<span class="fi-collab-mention">@Bob Martinez</span>');

    Event::assertDispatched(CommentPosted::class, fn (CommentPosted $event): bool => $event->record->is($this->article) && $event->by->is($this->alice) && str_ends_with((string) $event->url, "/documents/{$this->article->id}/edit"));
});

it('sends mentioned people a database notification, but not the author', function (): void {
    arrangeComments($this);

    commentsPage($this, $this->alice)->call('postCollaborationComment', '@Bob Martinez and @Alice Chen, have a look');

    expect($this->bob->notifications()->count())->toBe(1)
        ->and($this->alice->notifications()->count())->toBe(0)
        ->and($this->bob->notifications()->first()->data['title'])->toBe('Alice Chen mentioned you on Article');
});

it('suggests the people who can be mentioned', function (): void {
    arrangeComments($this);

    expect(commentsPage($this, $this->alice)->instance()->getCollaborationMentionableNames())->toBe(['Alice Chen', 'Bob Martinez']);
});

it('escapes what people write', function (): void {
    arrangeComments($this);

    $page = commentsPage($this, $this->alice)->call('postCollaborationComment', '<script>alert(1)</script>');

    expect(view('filament-collaboration::panel', ['page' => $page->instance()])->render())
        ->not->toContain('<script>alert(1)</script>')
        ->toContain('&lt;script&gt;');
});

it('ignores empty comments, overlong ones and fields that are not on the form', function (): void {
    arrangeComments($this);

    commentsPage($this, $this->alice)
        ->call('postCollaborationComment', '   ')
        ->call('postCollaborationComment', str_repeat('a', RecordComments::MAX_LENGTH + 1))
        ->call('postCollaborationComment', 'Hello', 'password');

    expect(DB::table('filament_collaboration_comments')->count())->toBe(0);
});

it('resolves and reopens a comment, with the count on the panel button', function (): void {
    arrangeComments($this);

    $page = commentsPage($this, $this->alice)
        ->call('postCollaborationComment', 'One')
        ->call('postCollaborationComment', 'Two', 'excerpt');

    expect(CollaborationPanelAction::make()->livewire($page->instance())->getBadge())->toEqual(2);

    $id = DB::table('filament_collaboration_comments')->min('id');

    commentsPage($this, $this->bob)->call('resolveCollaborationComment', $id);

    expect($page->instance()->getCollaborationOpenCommentCount())->toBe(1)
        ->and(DB::table('filament_collaboration_comments')->where('id', $id)->value('resolved_by'))->toBe('Bob Martinez');

    commentsPage($this, $this->alice)->call('resolveCollaborationComment', $id, false);

    expect($page->instance()->getCollaborationOpenCommentCount())->toBe(2);
});

it('lets nobody else see or resolve the comments of a record they cannot open', function (): void {
    arrangeComments($this);
    commentsPage($this, $this->alice)->call('postCollaborationComment', 'Private');

    $this->actingAs($this->stranger);

    Livewire::test(EditDocument::class, ['record' => $this->article->id])->assertNotFound();
});

it('forgets the comments of a record deleted for good', function (): void {
    arrangeComments($this);
    commentsPage($this, $this->alice)->call('postCollaborationComment', 'Soon gone');

    $this->article->forceDelete();

    expect(DB::table('filament_collaboration_comments')->count())->toBe(0);
});

it('keeps the comments of a record in the trash', function (): void {
    arrangeComments($this);
    commentsPage($this, $this->alice)->call('postCollaborationComment', 'Still here');

    $this->article->delete();

    expect(DB::table('filament_collaboration_comments')->count())->toBe(1);
});
