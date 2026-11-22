import { defineConfig } from 'vite'

// One script and one stylesheet, with no runtime dependencies: npm run build
export default defineConfig({
    publicDir: false,
    build: {
        outDir: 'resources/dist',
        emptyOutDir: true,
        lib: {
            entry: 'resources/js/index.js',
            name: 'FilamentCollaborationBundle',
            formats: ['iife'],
            fileName: () => 'collaboration.js',
            cssFileName: 'collaboration',
        },
    },
})
