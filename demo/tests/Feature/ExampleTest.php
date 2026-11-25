<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_home_page_is_the_blog(): void
    {
        $this->get('/')->assertOk()->assertSee('Fieldnotes');
    }
}
