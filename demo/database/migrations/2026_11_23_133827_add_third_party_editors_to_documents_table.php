<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table): void {
            $table->text('tinymce_html')->nullable();
            $table->text('ckeditor_html')->nullable();
            $table->text('quill_html')->nullable();
            $table->text('trix_html')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table): void {
            $table->dropColumn(['tinymce_html', 'ckeditor_html', 'quill_html', 'trix_html']);
        });
    }
};
