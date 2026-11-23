import { defineConfig } from 'vite'

// Builds one package's editor: PACKAGE=filament-tinymce vite build -c packages/vite.config.js
const name = process.env.PACKAGE

if (!name) throw new Error('Set PACKAGE to the package folder, such as filament-tinymce.')

export default defineConfig({
    publicDir: false,
    build: {
        outDir: `packages/${name}/resources/dist`,
        emptyOutDir: true,
        cssCodeSplit: false,
        lib: {
            entry: `packages/${name}/resources/js/editor.js`,
            formats: ['es'],
            fileName: () => 'editor.js',
            cssFileName: 'editor',
        },
        rollupOptions: { output: { inlineDynamicImports: true } },
    },
})
