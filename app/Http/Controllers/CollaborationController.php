<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

final class CollaborationController extends Controller
{
    public function heartbeat(Request $request): JsonResponse
    {
        $request->validate([
            'session_id' => ['required', 'uuid'],
            'document_id' => ['nullable', 'integer', 'min:1'],
            'page' => ['required', Rule::in(['list', 'create', 'view', 'edit'])],
        ]);
        $user = $request->user();
        abort_unless($user instanceof User, 401);
        $documentId = $request->integer('document_id');
        $page = $request->string('page')->toString();
        if (in_array($page, ['view', 'edit'], true)) {
            $document = Document::query()->where('workspace_id', $user->workspace_id)->findOrFail($documentId);
            abort_unless($user->can($page === 'edit' ? 'update' : 'view', $document), 404);
        } else {
            abort_if($documentId !== 0, 422);
            abort_unless($user->can($page === 'create' ? 'create' : 'viewAny', Document::class), 403);
        }
        $sessionId = $request->string('session_id')->toString();
        DB::table('collaboration_presence')->insertOrIgnore([
            'session_id' => $sessionId,
            'user_id' => $user->getAuthIdentifier(),
            'document_id' => $request->input('document_id'),
            'page' => $page,
            'seen_at' => now(),
        ]);
        $owned = DB::table('collaboration_presence')->where('session_id', $sessionId)
            ->where('user_id', $user->getAuthIdentifier());
        abort_unless((clone $owned)->exists(), 403);
        $owned->update([
            'document_id' => $request->input('document_id'),
            'page' => $page,
            'seen_at' => now(),
        ]);
        $presence = DB::table('collaboration_presence')->join('users', 'users.id', '=', 'collaboration_presence.user_id')
            ->leftJoin('documents', 'documents.id', '=', 'collaboration_presence.document_id')
            ->where('users.workspace_id', $user->workspace_id)
            ->where(function (Builder $query): void {
                $query->whereNull('collaboration_presence.document_id')
                    ->orWhereColumn('documents.workspace_id', 'users.workspace_id');
            })
            ->where('seen_at', '>=', now()->subSeconds(45))
            ->select('users.name', 'collaboration_presence.page', 'collaboration_presence.document_id')
            ->get();

        return response()->json(['presence' => $presence]);
    }

    public function updates(Request $request, Document $document): JsonResponse
    {
        $this->authorizeDocument($request, $document, 'view');
        $request->validate(['after' => ['nullable', 'integer', 'min:0']]);

        return response()->json(['updates' => DB::table('collaboration_updates')
            ->where('document_id', $document->getKey())->where('id', '>', $request->integer('after'))
            ->orderBy('id')->limit(500)->get(['id', 'update'])]);
    }

    private function authorizeDocument(Request $request, Document $document, string $ability): void
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->can($ability, $document), 404);
    }

    public function append(Request $request, Document $document): JsonResponse
    {
        $this->authorizeDocument($request, $document, 'update');
        $request->validate(['update' => ['required', 'string', 'max:65536'], 'client_update_id' => ['nullable', 'uuid']]);
        abort_if(base64_decode($request->string('update')->toString(), true) === false, 422);
        DB::transaction(function () use ($document, $request): void {
            Document::query()->whereKey($document->getKey())->lockForUpdate()->firstOrFail();
            $update = $request->string('update')->toString();
            $clientId = $request->input('client_update_id');
            if (is_string($clientId)) {
                $existing = DB::table('collaboration_updates')->where('document_id', $document->getKey())
                    ->where('client_update_id', $clientId)->value('update');
                if ($existing !== null) {
                    abort_unless($existing === $update, 409);

                    return;
                }
            }
            DB::table('collaboration_updates')->insert([
                'document_id' => $document->getKey(), 'update' => $update,
                'client_update_id' => $clientId, 'created_at' => now(), 'updated_at' => now(),
            ]);
        });

        return response()->json(['ok' => true]);
    }
}
