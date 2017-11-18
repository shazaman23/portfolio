@extends('layouts.app')

@section('content')

<!-- <div class="content">
    <div class="title m-b-md">
        Laravel
    </div>

    <div class="links">
        <a href="https://laravel.com/docs">Documentation</a>
        <a href="https://laracasts.com">Laracasts</a>
        <a href="https://laravel-news.com">News</a>
        <a href="https://forge.laravel.com">Forge</a>
        <a href="https://github.com/laravel/laravel">GitHub</a>
    </div>
</div> -->

<div class="content container-fluid">

  <div class="row home">

    <div class="col-11 offset-1
                col-md-3 offset-md-1
                col-lg-2 offset-lg-2
                align-self-center">
      <div class="title">
        <h1 class="display-3 text-left"><strong>Jake <br>Killpack</strong></h1>
        <h5 class="text-muted text-left">Web Developer</h5>
      </div>
    </div>

  </div>

  <div class="row about-me">
    <div class="w-100 d-flex flex-column">

      <!-- MAIN TITLE -->
      <h2 class="main-title text-center font-weight-bold">About Me</h2>

      <!-- FAMILY -->
      <div class="strip d-flex flex-row align-items-center">

        <h4 class="flex-1 text-center">Family</h4>

        <div class="flex-1 text-center">
          <img src="{{ URL::asset('/img/icons/home.png') }}" alt="family icon">
        </div>

      </div>

      <hr>

      <!-- GAMING -->
      <div class="strip d-flex flex-row-reverse align-items-center">

        <h4 class="flex-1 text-center">Gaming</h4>

        <div class="flex-1 text-center">
          <img src="{{ URL::asset('/img/icons/gamepad.png') }}" alt="family icon">
        </div>

      </div>

      <hr>

      <!-- LEARNING -->
      <div class="strip d-flex flex-row align-items-center">

        <h4 class="flex-1 text-center">Learning</h4>

        <div class="flex-1 text-center">
          <img src="{{ URL::asset('/img/icons/books.png') }}" alt="family icon">
        </div>

      </div>

      <hr>

      <!-- MOVIES -->
      <div class="strip d-flex flex-row-reverse align-items-center">

        <h4 class="flex-1 text-center">Movies</h4>

        <div class="flex-1 text-center">
          <img src="{{ URL::asset('/img/icons/tv.png') }}" alt="family icon">
        </div>

      </div>

      <hr>

      <!-- ADVENTURE -->
      <div class="strip d-flex flex-row align-items-center">

        <h4 class="flex-1 text-center">Adventure</h4>

        <div class="flex-1 text-center">
          <img src="{{ URL::asset('/img/icons/hiker.png') }}" alt="family icon">
        </div>

      </div>

    </div>
  </div>

  <div class="row my-work">

  </div>

  <div class="row contact-me">

  </div>
</div>

@endsection
