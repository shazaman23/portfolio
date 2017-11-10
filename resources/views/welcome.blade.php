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

  <div class="row">

    <div class="col-11 offset-1
                col-md-3 offset-md-1
                col-lg-2 offset-lg-2
                align-self-center">
      <div class="">
        <h1 class="display-3 text-left"><strong>Jake <br>Killpack</strong></h1>
        <h5 class="text-muted text-left">Web Developer</h5>
      </div>
    </div>

    <div class="col-12 col-md-8 align-self-center">
      <div class="">
        <img id="main-profile" class="img-fluid" src="{{ URL::asset('/img/profile-pic-wedding-CC.jpg') }}" alt="profile picture">
      </div>
    </div>

  </div>

  <div class="row">

  </div>
</div>

@endsection
