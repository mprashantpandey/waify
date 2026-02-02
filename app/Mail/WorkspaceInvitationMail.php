<?php

namespace App\Mail;

use App\Models\WorkspaceInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WorkspaceInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public WorkspaceInvitation $invitation)
    {
    }

    public function build(): self
    {
        $inviteUrl = route('register', [
            'invite' => $this->invitation->token,
            'email' => $this->invitation->email,
        ]);

        return $this->subject('You have been invited to join a workspace')
            ->view('emails.workspace-invitation')
            ->with([
                'invitation' => $this->invitation,
                'inviteUrl' => $inviteUrl,
            ]);
    }
}
