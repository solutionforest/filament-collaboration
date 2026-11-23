<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\PHPStan;

use PHPStan\Reflection\ClassMemberReflection;
use PHPStan\Reflection\ClassReflection;
use PHPStan\Reflection\FunctionVariant;
use PHPStan\Reflection\MethodReflection;
use PHPStan\Reflection\ParameterReflection;
use PHPStan\TrinaryLogic;
use PHPStan\Type\ArrayType;
use PHPStan\Type\BooleanType;
use PHPStan\Type\ClosureType;
use PHPStan\Type\Generic\TemplateTypeMap;
use PHPStan\Type\IntegerType;
use PHPStan\Type\StaticType;
use PHPStan\Type\StringType;
use PHPStan\Type\Type;
use PHPStan\Type\TypeCombinator;

/** @internal */
final readonly class MacroMethod implements MethodReflection
{
    public function __construct(
        private ClassReflection $class,
        private string $name,
    ) {}

    public function getDeclaringClass(): ClassReflection
    {
        return $this->class;
    }

    public function isStatic(): bool
    {
        return false;
    }

    public function isPrivate(): bool
    {
        return false;
    }

    public function isPublic(): bool
    {
        return true;
    }

    public function getDocComment(): ?string
    {
        return null;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getPrototype(): ClassMemberReflection
    {
        return $this;
    }

    public function getVariants(): array
    {
        return [new FunctionVariant(
            TemplateTypeMap::createEmpty(),
            null,
            $this->parameters(),
            false,
            new StaticType($this->class),
        )];
    }

    public function isDeprecated(): TrinaryLogic
    {
        return TrinaryLogic::createNo();
    }

    public function getDeprecatedDescription(): ?string
    {
        return null;
    }

    public function isFinal(): TrinaryLogic
    {
        return TrinaryLogic::createNo();
    }

    public function isInternal(): TrinaryLogic
    {
        return TrinaryLogic::createNo();
    }

    public function getThrowType(): ?Type
    {
        return null;
    }

    public function hasSideEffects(): TrinaryLogic
    {
        return TrinaryLogic::createYes();
    }

    /** @return list<ParameterReflection> */
    private function parameters(): array
    {
        if ($this->name === 'collaborative') {
            return [new MacroParameter('condition', TypeCombinator::union(new BooleanType, new ClosureType, new StringType))];
        }

        if ($this->name === 'lockWhileEditing') {
            return [new MacroParameter('condition', new BooleanType)];
        }

        return [
            new MacroParameter('ignore', new ArrayType(new IntegerType, new StringType)),
            new MacroParameter('presence', new BooleanType),
        ];
    }
}
