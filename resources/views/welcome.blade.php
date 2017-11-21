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
          <img src="{{ URL::asset('/img/icons/gamepad.png') }}" alt="gaming icon">
        </div>

      </div>

      <hr>

      <!-- LEARNING -->
      <div class="strip d-flex flex-row align-items-center">

        <h4 class="flex-1 text-center">Learning</h4>

        <div class="flex-1 text-center">
          <img src="{{ URL::asset('/img/icons/books.png') }}" alt="study icon">
        </div>

      </div>

      <hr>

      <!-- MOVIES -->
      <div class="strip d-flex flex-row-reverse align-items-center">

        <h4 class="flex-1 text-center">Movies</h4>

        <div class="flex-1 text-center">
          <img src="{{ URL::asset('/img/icons/tv.png') }}" alt="tv icon">
        </div>

      </div>

      <hr>

      <!-- ADVENTURE -->
      <div class="strip d-flex flex-row align-items-center">

        <h4 class="flex-1 text-center">Adventure</h4>

        <div class="flex-1 text-center">
          <img src="{{ URL::asset('/img/icons/hiker.png') }}" alt="adventure icon">
        </div>

      </div>

    </div>
  </div>

  <div class="row my-work">
    <div class="w-100 d-flex flex-column">

      <!-- MAIN TITLE -->
      <h2 class="main-title text-center font-weight-bold">My Work</h2>

      <!-- COMPUTER DEMO -->
      <div class="computer-demo">
        <div class="screen-demo"
             v-bind:style="[{ background: 'url(' + screenPath + ')' }, { backgroundSize: 'contain' }, { backgroundRepeat: 'no-repeat'}]">
        </div>
      </div>

      <!-- MENU -->
      <div class="menu d-flex flex-row flex-wrap text-center">

        <div id="uk2-dropdown" class="menu-option flex-1 text-center" v-on:mouseOver="setScreenBg('uk2-dropdown')">
          UK2 - Dropdown Cart
          <br>
          <small class="text-uppercase">Developed</small>
        </div>

        <div id="uk2-dont-forget" class="menu-option flex-1 text-center" v-on:mouseOver="setScreenBg('uk2-dont-forget')">
          UK2 - Don't Forget Overlay
          <br>
          <small class="text-uppercase">Developed</small>
        </div>

        <div id="uk2-bulk-search" class="menu-option flex-1 text-center" v-on:mouseOver="setScreenBg('uk2-bulk-search')">
          UK2 - Bulk Domain Search
          <br>
          <small class="text-uppercase">Developed</small>
        </div>

        <div id="uk2-disclaimers" class="menu-option flex-1 text-center" v-on:mouseOver="setScreenBg('uk2-disclaimers')">
          UK2 - Dynamic Disclaimers
          <br>
          <small class="text-uppercase">Designed & Developed</small>
        </div>

        <div id="benegov-site" class="menu-option flex-1 text-center" v-on:mouseOver="setScreenBg('benegov-site')">
          Benegov Website
          <br>
          <small class="text-uppercase">Designed & Developed</small>
        </div>

      </div>
      <!-- END MENU -->

    </div>
  </div>

  <div class="row contact-me">
    <div class="w-100 d-flex flex-column text-center">

      <!-- MAIN TITLE -->
      <h2 class="main-title font-weight-bold">Contact Me</h2>

      <!-- DESCRIPTION TEXT -->
      <span class="main-email"><i class="fi flaticon-envelope"></i><a href="mailto:contact@jakekillpack.com">contact@jakekillpack.com</a></span>

      <p>Need help with a project? Looking to hire? Fill in the form or use the link above to send me a message.</p>

      <p>I'll get back to you in a flash!</p>

      <!-- EMAIL FORM -->
      <form class="email-form text-left" action="index.php" method="post">

        <div class="form-row">

          <div class="form-group col simple-set">
            <label for="inputName">Name: </label>
            <input id="inputName" class="form-control" type="text" name="name" placeholder="John Doe">
          </div>

          <div class="form-group col simple-set">
            <label for="inputEmail">Return Email: </label>
            <input id="inputEmail" class="form-control" type="email" name="email" placeholder="johndoe@example.com">
          </div>

        </div>

        <div class="form-group">
          <label for="inputBody">How can I help?</label>
          <textarea id="inputBody" class="form-control" name="body" rows="10" cols="40" placeholder="John Doe's story..."></textarea>
        </div>

      </form>
      <!-- END EMAIL FORM -->

    </div>
  </div>

  <div class="row footer">
    <div class="w-100 d-flex flex-column">

      <h4 class="mx-auto">Icon Attributions</h4>

      <div class="d-flex flex-row icon-bib">
        <ul class="flex-1">
          <li>Books icon made by <a href="https://www.flaticon.com/authors/zlatko-najdenovski">Zlatko Najdenovski</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
          <li>Computer monitor icon made by <a href="http://icon-works.com">Icon Works</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
          <li>Email icon made by <a href="http://fontawesome.io">Dave Gandy</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
          <li>Gamepad icon made by <a href="http://www.freepik.com">Freepik</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
          <li>GitHub icon made by <a href="http://www.freepik.com">Freepik</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
        </ul>
        <ul class="flex-1">
          <li>Hiker icon made by <a href="http://www.freepik.com">Freepik</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
          <li>Home icon made by <a href="http://www.streamlineicons.com/">Webalys Freebies</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
          <li>Linkedin icon made by <a href="http://www.freepik.com">Freepik</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
          <li>Phone icon made by <a href="http://www.zurb.com">Zurb</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
          <li>TV icon made by <a href="http://www.freepik.com">Freepik</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
        </ul>

        <!-- <div class="flex-1">
          Font generated by <a href="http://www.flaticon.com">flaticon.com</a>.
          <p>
            Under <a href="http://creativecommons.org/licenses/by/3.0/">CC</a>:
            <a data-file="008-email-filled-closed-envelope" href="https://www.flaticon.com/authors/graphberry">GraphBerry</a>,
            <a data-file="007-envelope" href="https://www.flaticon.com/authors/dave-gandy">Dave Gandy</a>,
            <a data-file="006-phone-receiver" href="https://www.flaticon.com/authors/zurb">Zurb</a>,
            <a data-file="004-phone-symbol-of-an-auricular-inside-a-circle" href="https://www.flaticon.com/authors/simpleicon">SimpleIcon</a>,
            <a data-file="003-github" href="https://www.flaticon.com/authors/icomoon">Icomoon</a>,
            <a data-file="001-linkedin" href="http://www.freepik.com">Freepik</a>
          </p>

        </div> -->
      </div>

      <div class="w-100 d-flex flex-row contact-info text-center">

        <!-- GITHUB -->
        <div class="flex-1">
          <a href="https://github.com/shazaman23"><i class="fi flaticon-github-logo"></i> GitHub</a>
        </div>

        <!-- LINKEDIN -->
        <div class="flex-1">
          <a href="https://www.linkedin.com/in/jacob-killpack-overview/"><i class="fi flaticon-linkedin"></i> Linkedin</a>
        </div>

        <!-- PHONE -->
        <!-- <div class="flex-1">
          <i class="fi flaticon-phone-receiver"></i> (435) 757-7375
        </div> -->

        <!-- EMAIL -->
        <div class="flex-1">
          <a href="mailto:contact@jakekillpack.com"><i class="fi flaticon-envelope"></i> contact@jakekillpack.com</a>
        </div>

      </div>

    </div>
  </div>

</div>

@endsection
