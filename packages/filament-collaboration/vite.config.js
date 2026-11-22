import { defineConfig } from 'vite';

// Paths are relative to the app root (where `npm run build:package` is invoked).
export default defineConfig({
    publicDir: false,
    build: {
        lib: {
            entry: 'packages/filament-collaboration/resources/js/collaborative-rich-editor.js',
            formats: ['es'],
            fileName: () => 'collaborative-rich-editor.js',
        },
        outDir: 'packages/filament-collaboration/resources/dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
            },
        },
    },
});

