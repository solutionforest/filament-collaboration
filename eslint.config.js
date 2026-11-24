import js from '@eslint/js'
import globals from 'globals'

/** Lint rules for the browser code and its tests: `npm run lint`. Types are checked by `npm run typecheck`. */
export default [
    // `scripts/` holds superseded browser scripts; the maintained ones are in `demo/tests/browser`.
    {
        ignores: ['resources/dist/**', 'node_modules/**', 'scripts/**', 'demo/*', '!demo/tests', 'demo/tests/*', '!demo/tests/browser', '!demo/scripts', 'demo/scripts/browser-*', '!demo/packages', 'demo/packages/*/resources/dist/**', 'website/node_modules/**', 'website/src/**', 'website/.vitepress/cache/**', 'website/.vitepress/dist/**'],
    },
    js.configs.recommended,
    {
        files: ['**/*.js', '**/*.mjs'],
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: { ...globals.browser },
        },
        rules: {
            curly: ['error', 'multi-line'],
            eqeqeq: ['error', 'always'],
            'no-console': ['error', { allow: ['warn', 'error'] }],
            'no-shadow': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-const': 'error',
        },
    },
    {
        // Node scripts; the browser tests also run code in the page, so they see both.
        files: ['tests/js/**', 'demo/tests/browser/**', 'demo/scripts/**', 'demo/packages/vite.config.js', 'vite.config.js', 'eslint.config.js', 'website/scripts/**'],
        languageOptions: { globals: { ...globals.node, ...globals.browser } },
        // `page.evaluate((x) => ..., x)` passes values into the page under the same name.
        rules: { 'no-console': 'off', 'no-shadow': 'off' },
    },
]
