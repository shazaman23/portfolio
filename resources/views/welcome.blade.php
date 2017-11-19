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
    <div class="w-100 d-flex flex-column">

      <div class="computer-demo">
        <div class="screen-demo"></div>
      </div>

      <div class="menu d-flex flex-row flex-wrap text-center">
        <div id="uk2-dropdown" class="menu-option flex-1 text-center">
          UK2 - Dropdown Cart
          <br>
          <small class="text-uppercase">Developed</small>
        </div>
        <div id="uk2-dont-forget" class="menu-option flex-1 text-center">
          UK2 - Don't Forget Overlay
          <br>
          <small class="text-uppercase">Developed</small>
        </div>
        <div id="uk2-bulk-search" class="menu-option flex-1 text-center">
          UK2 - Bulk Domain Search
          <br>
          <small class="text-uppercase">Developed</small>
        </div>
        <div id="uk2-disclaimers" class="menu-option flex-1 text-center">
          UK2 - Dynamic Disclaimers
          <br>
          <small class="text-uppercase">Designed & Developed</small>
        </div>
        <div id="benegov-site" class="menu-option flex-1 text-center">
          Benegov Website
          <br>
          <small class="text-uppercase">Designed & Developed</small>
        </div>
      </div>

    </div>
  </div>

  <div class="row contact-me">

  </div>
</div>

@endsection

@section('footer')

@endsection
