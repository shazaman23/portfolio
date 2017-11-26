@extends('layouts.app')

@section('content')


<div class="content showcase container-fluid">

  <!-- BACK BUTTON -->
  <div class="position-absolute back-btn">
    <a class="text-uppercase" href="/#my-work"><-- Back</a>
  </div>

  <!-- MAIN TITLE -->
  <h2 class="main-title text-center font-weight-bold">{{ $experience->brand }} - {{ $experience->title }}</h2>

  <div class="row align-items-center">

    <!-- FEATURES -->
    <div class="offset-md-1 col-md-6 features">
        <p>{{ $experience->problem }}</p>
        <p>{{ $experience->description }}</p>
        <p>{{ $experience->demoText }} <a href="{{ $experience->url }}">Check it out!!</a></p>
    </div>

    <!-- DISPLAY -->
    <div class="col-md-5 display cellphone">

      @if( $experience->noMobile )
        <div class="screen-demo no-mobile"
             style="background: white;">
          This feature is not available for mobile devices.
        </div>
      @else
        <div class="screen-demo"
             style="background: url('/img/screenshots/mobile/{{ $experience->backgroundImage }}');">
        </div>
      @endif

    </div>

  </div>

</div>

@endsection
