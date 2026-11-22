import { defineConfig } from 'vite';

// Build the package Alpine component. Run from repo root: `npm run build`
export default defineConfig({
    publicDir: false,
    build: {
        lib: {
            entry: 'resources/js/collaborative-rich-editor.js',
            formats: ['es'],
            fileName: () => 'collaborative-rich-editor.js',
        },
        outDir: 'resources/dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
            },
        },
    },
});
