<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Document;
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
            'document_id' => ['nullable', 'integer', Rule::exists('documents', 'id')],
            'page' => ['required', Rule::in(['list', 'create', 'view', 'edit'])],
        ]);
        $user = $request->user();
        abort_unless($user !== null, 401);
        $sessionId = $request->string('session_id')->toString();
        $claimed = DB::table('collaboration_presence')->where('session_id', $sessionId)->where('user_id', '!=', $user->getAuthIdentifier())->exists();
        abort_if($claimed, 403);
        DB::table('collaboration_presence')->updateOrInsert(['session_id' => $sessionId], [
            'user_id' => $user->getAuthIdentifier(),
            'document_id' => $request->input('document_id'),
            'page' => $request->string('page')->toString(),
            'seen_at' => now(),
        ]);
        $presence = DB::table('collaboration_presence')->join('users', 'users.id', '=', 'collaboration_presence.user_id')
            ->where('seen_at', '>=', now()->subSeconds(45))
            ->select('users.name', 'collaboration_presence.page', 'collaboration_presence.document_id')
            ->get();

        return response()->json(['presence' => $presence]);
    }

    public function updates(Request $request, Document $document): JsonResponse
    {
        $request->validate(['after' => ['nullable', 'integer', 'min:0']]);

        return response()->json(['updates' => DB::table('collaboration_updates')
            ->where('document_id', $document->getKey())->where('id', '>', $request->integer('after'))
            ->orderBy('id')->limit(500)->get(['id', 'update'])]);
    }

    public function append(Request $request, Document $document): JsonResponse
    {
        $request->validate(['update' => ['required', 'string', 'max:65536']]);
        abort_if(base64_decode($request->string('update')->toString(), true) === false, 422);
        DB::table('collaboration_updates')->insert([
            'document_id' => $document->getKey(), 'update' => $request->string('update')->toString(),
            'created_at' => now(), 'updated_at' => now(),
        ]);

        return response()->json(['ok' => true]);
    }
}
