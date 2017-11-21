<?php

namespace App\Mail;


use Illuminate\Http\Request;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class ViewerContact extends Mailable
{
    use Queueable, SerializesModels;

    private $request;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(Request $request)
    {
      $this->request = $request;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->from($this->request->email)
                    ->markdown('emails.viewerContact')
                    ->with([
                        'name' => $this->request->name,
                        'email' => $this->request->email,
                        'body' => $this->request->body
                    ]);
    }
}
