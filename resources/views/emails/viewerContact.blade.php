@component('mail::message')

#You're a hit!

You have a new hit from your portfolio website!

#{{ $name }}

@component('mail::panel')
{{ $body }}
@endcomponent

The user's return address is
#{{ $email }}

Thanks,<br>
{{ config('app.name') }}
@endcomponent
