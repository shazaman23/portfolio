@extends('layouts.app')

@section('content')

<div class="content showcase container-fluid">

  <!-- MAIN TITLE -->
  <h2 class="main-title text-center font-weight-bold">{{ $experience->brand }} - {{ $experience->title }}</h2>

  <div class="row align-items-center">

    <div class="offset-md-1 col-md-6 features">
        <p>{{ $experience->problem }}</p>
        <p>{{ $experience->description }}</p>
        <p><a href="{{ $experience->url }}">Check it out!!</a></p>
    </div>

    <div class="col-md-5 display cellphone">
      <div class="screen-demo"
           style="background: url('/img/screenshots/mobile/{{ $experience->backgroundImage }}');">
      </div>
    </div>

  </div>

</div>

@endsection
