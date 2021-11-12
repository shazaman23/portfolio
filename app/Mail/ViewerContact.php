<?php

namespace App\Mail;

use Illuminate\Http\Request;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ViewerContact extends Mailable
{
    use Queueable, SerializesModels;

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
        return $this->from($this->request->email, $this->request->name)
                    ->subject("Viewer Contact - " . $this->request->name)
                    ->markdown('emails.viewerContact')
                    ->with([
                        'name' => $this->request->name,
                        'email' => $this->request->email,
                        'body' => $this->request->body
                    ]);
    }
}
