<?php

namespace Tests\Support;

use App\Filament\Resources\Documents\DocumentResource;
use App\Models\Document as Article;
use App\Models\User;
use Illuminate\Testing\TestResponse;
use SolutionForest\Collaboration\Crdt\Document;
use Tests\TestCase;

/** A browser tab, played by PHP: a real page load, then the real endpoint. */
class Editor
{
    /** @var array<string, mixed> */
    public array $config = [];

    public ?Document $document = null;

    /** @var list<array{n: int, ops: list<array<string, mixed>>}> */
    public array $pending = [];

    public int $epoch = 0;

    public int $sequence = -1;

    private int $number = 0;

    public function __construct(private TestCase $test, public User $user, public ?string $guard = null) {}

    public static function open(TestCase $test, User $user, Article $article, string $page = 'edit'): self
    {
        $editor = new self($test, $user);
        $url = in_array($page, ['index', 'create'], true)
            ? DocumentResource::getUrl($page)
            : DocumentResource::getUrl($page, ['record' => $article]);

        return self::openUrl($test, $user, $url);
    }

    /** Any page with a room, such as a translated page in one language, signed in with any guard. */
    public static function openUrl(TestCase $test, User $user, string $url, ?string $guard = null): self
    {
        $editor = new self($test, $user, $guard);
        $html = (string) $test->actingAs($user, $guard)->get($url)->assertOk()->getContent();

        if (preg_match('/data-collaboration="([^"]+)"/', $html, $match) !== 1) {
            throw new \RuntimeException('The page has no collaboration room.');
        }

        $editor->config = json_decode(html_entity_decode($match[1], ENT_QUOTES | ENT_HTML5), true);

        return $editor;
    }

    public function type(string $field, mixed $value): self
    {
        $this->document ?? $this->sync();

        $operations = $this->document->changes($field, $value, client: $this->config['client']);
        $this->document->apply($operations);
        $this->pending[] = ['n' => ++$this->number, 'ops' => $operations];

        return $this;
    }

    /** @param array<string, mixed> $extra */
    public function send(array $extra = []): TestResponse
    {
        return $this->test->actingAs($this->user, $this->guard)->postJson($this->config['url'], [
            'token' => $this->config['token'],
            'epoch' => $this->epoch,
            'since' => $this->sequence,
            'batches' => $this->pending,
            ...$extra,
        ]);
    }

    /** @param array<string, mixed> $extra */
    public function sync(array $extra = []): TestResponse
    {
        $response = $this->send($extra)->assertOk();

        $this->pending = [];

        if ($response->json('state') !== null) {
            $this->document = Document::from($response->json('state'));
        } elseif ($this->document !== null) {
            $this->document->apply($response->json('operations') ?? []);
        }

        $this->epoch = (int) $response->json('epoch');
        $this->sequence = (int) $response->json('sequence');

        return $response;
    }

    public function value(string $field): mixed
    {
        return $this->document?->value($field);
    }

    /** What the browser puts into Livewire for Save. */
    public function syncState(): string
    {
        return (string) json_encode([
            'epoch' => $this->epoch,
            'fields' => array_keys($this->config['fields']),
            'batches' => $this->pending,
        ]);
    }
}
