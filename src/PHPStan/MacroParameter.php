<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\PHPStan;

use PHPStan\Reflection\ParameterReflection;
use PHPStan\Reflection\PassedByReference;
use PHPStan\Type\Type;

/** @internal */
final readonly class MacroParameter implements ParameterReflection
{
    public function __construct(
        private string $name,
        private Type $type,
    ) {}

    public function getName(): string
    {
        return $this->name;
    }

    public function isOptional(): bool
    {
        return true;
    }

    public function getType(): Type
    {
        return $this->type;
    }

    public function passedByReference(): PassedByReference
    {
        return PassedByReference::createNo();
    }

    public function isVariadic(): bool
    {
        return false;
    }

    public function getDefaultValue(): ?Type
    {
        return null;
    }
}
