@extends('layouts.app')

@section('content')

<div class="content showcase container-fluid">

  <!-- MAIN TITLE -->
  <h2 class="main-title text-center font-weight-bold">{{ $experience->brand }} - {{ $experience->title }}</h2>

  <div class="row">

    <div class="offset-md-1 col-md-5 features">
      <p>{{ $experience->problem }}</p>
      <p>{{ $experience->description }}</p>
      <p><a href="{{ $experience->url }}">Check it out!!</a></p>
    </div>

    <div class="col-md-7 display">

    </div>

  </div>

</div>

@endsection
