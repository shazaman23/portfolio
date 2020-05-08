@extends('layouts.app')

@section('content')


<div class="content showcase container-fluid position-relative">

  <!-- BACK BUTTON -->
  <div class="position-absolute back-btn">
    <a class="text-uppercase" href="/#my-work"><i class="fas fa-arrow-left"></i> Back</a>
  </div>

  <!-- MAIN TITLE -->
  <h2 class="main-title text-center font-weight-bold">{{ $experience->brand }} - {{ $experience->title }}</h2>

  <!-- DISPLAY -->
  <div class="display cellphone">
    <!-- <div class=""> -->

    @if( $experience->noMobile )
      <div class="screen-demo no-mobile">
        This feature is not available for mobile devices.
      </div>
    @else
      <div class="screen-demo" style="background: url('/img/screenshots/mobile/{{ $experience->backgroundImage }}');">
      </div>
    @endif

  </div>

  <!-- <div class="row align-items-center"> -->
  <div class="">

    <!-- FEATURES -->
    <div class="features">
    <!-- <div class=""> -->
      <p>{{ $experience->problem }}</p>
      <p>{{ $experience->description }}</p>
      <p>{{ $experience->demoText }} @if( $experience->brand == "Benegov" ) (site no longer running) @else<a href="{{ $experience->url }}">Check it out!!</a>@endif</p>
    </div>

  </div>

</div>

<div class="footer">
  <div class="w-100 d-flex flex-column">

    <!-- ICON ATTRIBUTIONS -->
    <h4 class="mx-auto">Icon Attributions</h4>

    <div class="d-flex icon-bib">
      <ul class="flex-1">
        <li>Cellphone icon made by <a href="http://www.freepik.com">Freepik</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
        <li>Email icon made by <a href="http://fontawesome.io">Dave Gandy</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
        <!-- <li>Phone icon made by <a href="http://www.zurb.com">Zurb</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li> -->
      </ul>
      <ul class="flex-1">
        <li>GitHub icon made by <a href="http://www.freepik.com">Freepik</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
        <li>Linkedin icon made by <a href="http://www.freepik.com">Freepik</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
        <!-- <li>Books icon made by <a href="https://www.flaticon.com/authors/zlatko-najdenovski">Zlatko Najdenovski</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li> -->
        <!-- <li>Computer monitor icon made by <a href="http://icon-works.com">Icon Works</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li> -->
        <!-- <li>Gamepad icon made by <a href="http://www.freepik.com">Freepik</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li> -->
        <!-- <li>Hiker icon made by <a href="http://www.freepik.com">Freepik</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li> -->
        <!-- <li>Home icon made by <a href="http://www.streamlineicons.com/">Webalys Freebies</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li> -->
        <!-- <li>TV icon made by <a href="http://www.freepik.com">Freepik</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li> -->
      </ul>

    </div>

    <!-- CONTACT INFO -->
    <div class="w-100 d-flex contact-info text-center">

      <!-- GITHUB -->
      <div class="flex-1">
        <a href="https://github.com/shazaman23"><i class="fi flaticon-github"></i> GitHub</a>
      </div>

      <!-- LINKEDIN -->
      <div class="flex-1">
        <a href="https://www.linkedin.com/in/jacob-killpack-overview/"><i class="fi flaticon-linkedin"></i> Linkedin</a>
      </div>

      <!-- PHONE -->
      <!-- <div class="flex-1">
      <i class="fi flaticon-phone"></i> (435) 757-7375
    </div> -->

    <!-- EMAIL -->
    <div class="flex-1">
      <a href="mailto:contact@jakekillpack.com"><i class="fi flaticon-email"></i> contact@jakekillpack.com</a>
    </div>

  </div>

</div>
</div>

@endsection
