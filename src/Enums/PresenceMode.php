<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Enums;

enum PresenceMode: string
{
    case Browsing = 'browsing';
    case Creating = 'creating';
    case Viewing = 'viewing';
    case Editing = 'editing';

    public function getLabel(): string
    {
        return __('filament-collaboration::collaboration.modes.'.$this->value);
    }
}
