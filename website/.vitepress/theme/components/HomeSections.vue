<script setup lang="ts">
import { withBase } from 'vitepress'

const gallery = [
    { file: 'live-editing.png', title: 'Editing together', text: 'Carets, selections and a field outline for everybody on the record.' },
    { file: 'comments.png', title: 'Comments with @mentions', text: 'On the record or a field, in one slide-over behind the chat icon.' },
    { file: 'history.png', title: 'Version history', text: 'Restore any version of the shared draft, for everybody.' },
    { file: 'hidden-field.png', title: 'Nobody out of sight', text: 'Initials on the closed tab, step or section a colleague is behind.' },
    { file: 'translations.png', title: 'Two languages at once', text: 'One shared draft per language, everybody in one room.' },
    { file: 'third-party-editors.png', title: 'Any editor', text: 'TinyMCE, CKEditor, Quill and Trix, live through adapters.' },
    { file: 'live-uploads.png', title: 'Live uploads', text: 'A file one person uploads is in everybody’s form at once.' },
    { file: 'resource-table.png', title: 'Presence in tables', text: 'Who is on which record, right in the list.' },
    { file: 'dark-mode.png', title: 'Dark mode', text: 'Every colour works in Filament’s light and dark themes.' },
]
</script>

<template>
    <div class="home-sections">
        <section id="tutorial" class="home-section">
            <p class="home-eyebrow">One minute</p>
            <h2>Two browsers, one record</h2>
            <p class="home-lead">Typing together, the rich editor, undo, saving, comments with an @mention, and restoring an earlier draft for everybody.</p>
            <div class="home-frame">
                <video :src="withBase('/media/tutorial.mp4')" controls muted playsinline preload="metadata" :poster="withBase('/media/live-editing.png')" aria-label="Tutorial: two people editing one Filament record" />
            </div>
        </section>

        <section class="home-section">
            <p class="home-eyebrow">Quick start</p>
            <h2>Three steps, no rewrite</h2>
            <div class="home-steps">
                <div class="home-step">
                    <span class="home-step-number">1</span>
                    <h3>Install</h3>
                    <pre><code>composer require solutionforest/filament-collaboration
php artisan migrate</code></pre>
                </div>
                <div class="home-step">
                    <span class="home-step-number">2</span>
                    <h3>Add the plugin</h3>
                    <pre><code>$panel->plugin(CollaborationPlugin::make());</code></pre>
                </div>
                <div class="home-step">
                    <span class="home-step-number">3</span>
                    <h3>Add a trait</h3>
                    <pre><code>class EditPost extends EditRecord
{
    use InteractsWithCollaboration;
}</code></pre>
                </div>
            </div>
            <p class="home-more"><a :href="withBase('/getting-started')">Read the full install guide →</a></p>
        </section>

        <section class="home-section">
            <p class="home-eyebrow">Screenshots</p>
            <h2>Taken from real sessions</h2>
            <p class="home-lead">Every image is captured from two or more browsers on the demo CMS by a script that only saves once what it shows is on screen.</p>
            <div class="home-gallery">
                <figure v-for="shot in gallery" :key="shot.file" class="home-shot">
                    <a :href="withBase(`/media/${shot.file}`)" target="_blank" rel="noopener">
                        <img :src="withBase(`/media/${shot.file}`)" :alt="shot.title" loading="lazy" width="1440" height="960" />
                    </a>
                    <figcaption>
                        <strong>{{ shot.title }}</strong>
                        <span>{{ shot.text }}</span>
                    </figcaption>
                </figure>
            </div>
        </section>

        <section class="home-section home-cta">
            <h2>Requirements</h2>
            <p class="home-lead">PHP 8.3+, Laravel 12 or 13, Filament 5.8.3+, and a database Laravel supports. MIT licensed.</p>
            <div class="home-cta-actions">
                <a class="home-button home-button-brand" :href="withBase('/getting-started')">Get started</a>
                <a class="home-button" href="https://github.com/solutionforest/filament-collaboration">Star on GitHub</a>
            </div>
        </section>
    </div>
</template>
