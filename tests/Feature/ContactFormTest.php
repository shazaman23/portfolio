<?php

namespace Tests\Feature;

use App\Mail\ViewerContact;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactFormTest extends TestCase
{
    /**
     * The visitor's address goes in Reply-To, never From: sending as someone
     * else's domain fails SPF/DMARC at the receiving end.
     *
     * @return void
     */
    public function test_contact_email_is_from_the_site_address_and_replies_to_the_visitor()
    {
        Mail::fake();
        config([
            'mail.from.address' => 'portfolio@jakekillpack.com',
            'mail.from.name' => "Jake's Portfolio",
        ]);

        $this->post('/send', [
            'name' => 'Jane Visitor',
            'email' => 'jane@example.com',
            'body' => 'Hello from the contact form',
        ])->assertRedirect('/');

        $sent = null;
        Mail::assertSent(ViewerContact::class, function (ViewerContact $mail) use (&$sent) {
            $sent = $mail;
            return true;
        });
        $sent->build();

        $this->assertTrue($sent->hasTo('intechninja@gmail.com'), 'Should be sent to the site owner');
        $this->assertTrue($sent->hasFrom('portfolio@jakekillpack.com', "Jake's Portfolio"), 'From should be the site address');
        $this->assertFalse($sent->hasFrom('jane@example.com'), 'From should not be the visitor');
        $this->assertTrue($sent->hasReplyTo('jane@example.com', 'Jane Visitor'), 'Reply-To should be the visitor');
    }
}
