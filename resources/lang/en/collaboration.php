<?php

declare(strict_types=1);

return [
    'someone' => 'Someone',
    'busy' => 'Someone else is saving this record. Try again in a moment.',
    'presence' => [
        'others' => 'People on this record',
        'count' => '{1} :count other person|[2,*] :count other people',
        'focus' => ':name is in :field',
    ],
    'save_notice' => ':name saved this record',
    'pull' => [
        'action' => 'Get their changes',
        'title' => 'Form updated',
        'taken' => 'Pulled changes for: :fields',
        'conflicts' => 'Some fields still conflict: :fields',
    ],
    'conflict' => [
        'heading' => 'Resolve changes with :name',
        'description' => '{1} You and :name both changed this field.|[2,*] You and :name both changed these fields.',
        'mine' => 'Keep mine',
        'theirs' => 'Use :name\'s',
        'stale' => 'The record changed again. Close this dialog and save once more.',
    ],
    'column' => [
        'label' => 'People on record',
    ],
];
