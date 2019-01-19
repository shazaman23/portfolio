<!doctype html>
<html lang="{{ app()->getLocale() }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ env('APP_NAME') }}</title>

        <!-- Favicon -->
        <link rel="icon" href="/img/icons/brand-icon.png">

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css?family=Raleway:100,600" rel="stylesheet" type="text/css">
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.4.1/css/all.css" integrity="sha384-5sAR7xN1Nv6T6+dT2mhtzEpVJvfS3NScPQTrOxhwjIuvcA67KV2R5Jz6kr4abQsz" crossorigin="anonymous">

        <!-- Styles -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
        <link rel="stylesheet" href="/css/app.css">

    </head>
    <body>

        <div id="app" class="flex-center position-ref full-height">

            @if (Route::has('login'))
                <div class="top-right links">
                    @auth
                        <a href="{{ url('/home') }}">Home</a>
                    @else
                        <a href="{{ route('login') }}">Login</a>
                        <a href="{{ route('register') }}">Register</a>
                    @endauth
                </div>
            @endif

            @if (Session::has('status'))
              <div class="alert alert-success flash-alert" v-bind:class="{ 'hide-alert': timeout }">
                  <p>{{ Session::get('status') }}</p>
              </div>
            @elseif (Session::has('emailError'))
              <div class="alert alert-danger flash-alert" v-bind:class="{ 'hide-alert': timeout }">
                <p>There was an error sending the email. Please try again later.</p>
              </div>
            @endif

            @yield('content')

        </div>

        <!-- Scripts -->
        <script type="text/javascript" src="/js/app.js"></script>

    </body>
</html>
