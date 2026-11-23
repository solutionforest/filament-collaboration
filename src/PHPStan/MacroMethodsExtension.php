<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\PHPStan;

use Filament\Actions\EditAction;
use Filament\Forms\Components\Field;
use PHPStan\Reflection\ClassReflection;
use PHPStan\Reflection\MethodReflection;
use PHPStan\Reflection\MethodsClassReflectionExtension;

/**
 * Teaches PHPStan about `->collaborative()` and `->collaborate()`.
 * Include `extension.neon` from this package to use it.
 */
final class MacroMethodsExtension implements MethodsClassReflectionExtension
{
    private const MACROS = ['collaborative' => Field::class, 'lockWhileEditing' => Field::class, 'collaborate' => EditAction::class];

    public function hasMethod(ClassReflection $classReflection, string $methodName): bool
    {
        $class = self::MACROS[$methodName] ?? null;

        return $class !== null && $classReflection->is($class);
    }

    public function getMethod(ClassReflection $classReflection, string $methodName): MethodReflection
    {
        return new MacroMethod($classReflection, $methodName);
    }
}
