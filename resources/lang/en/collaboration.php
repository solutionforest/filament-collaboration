<?php

declare(strict_types=1);

return [
    'someone' => 'Someone',
    'busy' => 'Someone else is saving this record. Try again in a moment.',
    'foreign_upload' => 'An image is still waiting to be saved by the person who uploaded it. Ask them to save first.',

    'modes' => [
        'browsing' => 'Browsing',
        'creating' => 'Creating',
        'viewing' => 'Viewing',
        'editing' => 'Editing',
    ],

    'values' => [
        'empty' => '(empty)',
        'yes' => 'Yes',
        'no' => 'No',
    ],

    'column' => [
        'label' => 'People on record',
        'empty' => 'Nobody else is here',
    ],

    'pull' => [
        'title' => 'Form updated',
        'taken' => 'Updated: :fields',
        'conflicts' => 'You will choose a version when you save: :fields',
    ],

    'conflict' => [
        'heading' => 'Resolve changes with :name',
        'description' => '{1} You and :name both changed this field.|[2,*] You and :name both changed these fields.',
        'modal' => ':name saved different values. Save again to keep yours, or cancel to keep theirs.',
        'mine' => 'Keep mine',
        'theirs' => 'Use the version from :name',
        'submit' => 'Save my choices',
        'stale' => 'The record changed again. Close this dialog and save once more.',
    ],

    'discard' => [
        'heading' => 'Discard the shared draft?',
        'description' => 'Unsaved changes from everyone in the fields you can edit go back to the last saved version.',
        'action' => 'Discard draft',
    ],

    'comments' => [
        'none' => 'No comments yet.',
        'placeholder' => 'Write a comment. Type @ to mention somebody.',
        'on' => 'On',
        'whole_record' => 'The whole record',
        'post' => 'Comment',
        'resolve' => 'Resolve',
        'reopen' => 'Reopen',
        'resolved' => 'Resolved by :name',
        'resolved_heading' => 'Resolved (:count)',
        'mentioned' => ':name mentioned you on :record',
        'view' => 'View',
    ],

    'panel' => [
        'label' => 'Comments & history',
        'heading' => 'Comments & history',
        'close' => 'Close',
        'comments' => 'Comments',
        'history' => 'History',
        'no_history' => 'Nothing has changed yet.',
        'restore' => 'Restore the draft from :time',
        'restore_confirm' => 'Restore the shared draft as it was at :time, for everybody? The draft as it is now is kept in the history.',
        'restored' => 'Draft restored for everybody',
        'reasons' => [
            'edit' => 'Edited by :name',
            'save' => 'Saved by :name',
            'before' => 'Before :name restored',
            'restore' => 'Restored by :name',
        ],
    ],

    'debug' => [
        'label' => 'Collaboration inspector',
        'heading' => 'Collaboration inspector',
        'description' => 'What this tab is syncing. Field contents are never shown.',
        'close' => 'Close',
    ],

    // Sent to the browser.
    'client' => [
        'connecting' => 'Connecting…',
        'synced' => 'All changes shared',
        'syncing' => 'Sharing…',
        'unsaved' => 'Draft not saved',
        'offline' => 'Offline — retrying',
        'stopped' => 'Live editing stopped — changes merge when you save',
        'denied' => 'You no longer have access',
        'deleted' => 'This record was deleted',
        'busy_field' => ':name is editing this field. Changes merge when saved.',
        'locked_field' => ':name is editing this field',
        'deleted_by' => ':name deleted this record',
        'copy' => 'Copy my text',
        'copied' => 'Copied',
        'restore' => 'Restore',
        'saved' => ':name saved',
        'not_recovered' => 'Some unsent edits from before the reload could not be recovered',
        'pull' => 'Get changes',
        'discard' => 'Discard shared draft',
        'people' => 'People here',
        'alone' => 'Nobody else is here',
        'you' => 'You, another tab',
        'idle' => 'Away',
        'in_field' => 'In :field',
        'more' => ':count more',
        'jump' => 'Go to :name',
        'follow' => 'Follow',
        'follow_title' => 'Keep going to the field :name is in',
        'following' => 'Following :name',
        'stop_following' => 'Stop following',
    ],
];
