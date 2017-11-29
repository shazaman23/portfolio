@extends('layouts.app')

@section('content')

<div class="content container-fluid">

  <div class="row home">

    <!-- MAIN TITLE -->
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
      <div class="strip d-flex flex-row align-items-center" v-bind:class="{ 'is-open': stripActive[0] }" v-on:click="toggleIsOpen(0)">

        <div class="flex-1 text-center strip-content">

          <h4 class="strip-label">Family</h4>

          <div class="strip-image">
            <!-- This picture was taken by my Mom, Kathleen Killpack -->
            <img src="/img/family-cabin.jpg" alt="family picture">
          </div>

        </div>

        <div class="flex-1 text-center strip-content">

          <i class="fi flaticon-home large strip-icon"></i>

          <div class="strip-paragraph">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>

        </div>

      </div>

      <hr>

      <!-- GAMING -->
      <div class="strip d-flex flex-row-reverse align-items-center" v-bind:class="{ 'is-open': stripActive[1] }" v-on:click="toggleIsOpen(1)">

        <div class="flex-1 text-center strip-content">

          <h4 class="strip-label">Gaming</h4>

          <div class="strip-image">
            <!-- I took this picture myself! Crazy, huh? Phone cameras are pretty great... -->
            <img src="/img/betrayal-game-slim.jpg" alt="board game">
          </div>

        </div>

        <div class="flex-1 text-center strip-content">

          <i class="fi flaticon-gamepad large strip-icon"></i>

          <div class="strip-paragraph">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>

        </div>

      </div>

      <hr>

      <!-- LEARNING -->
      <div class="strip d-flex flex-row align-items-center" v-bind:class="{ 'is-open': stripActive[2] }" v-on:click="toggleIsOpen(2)">

        <div class="flex-1 text-center strip-content">

          <h4 class="strip-label">Learning</h4>

          <div class="strip-image">
            <!-- This picture was taken by the lovely Nikelle Maughan -->
            <img src="/img/studying.jpg" alt="studying">
          </div>

        </div>

        <div class="flex-1 text-center strip-content">

          <i class="fi flaticon-books large strip-icon"></i>

          <div class="strip-paragraph">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>

        </div>

      </div>

      <hr>

      <!-- MOVIES -->
      <div class="strip d-flex flex-row-reverse align-items-center" v-bind:class="{ 'is-open': stripActive[3] }" v-on:click="toggleIsOpen(3)">

        <div class="flex-1 text-center strip-content">

          <h4 class="strip-label">Movies</h4>

          <!-- Again, I took this picture. Maybe I should go into photography... -->
          <div class="strip-image">
            Picture will go here
          </div>

        </div>

        <div class="flex-1 text-center strip-content">

          <i class="fi flaticon-tv large strip-icon"></i>

          <div class="strip-paragraph">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>

        </div>

      </div>

      <hr>

      <!-- ADVENTURE -->
      <div class="strip d-flex flex-row align-items-center" v-bind:class="{ 'is-open': stripActive[4] }" v-on:click="toggleIsOpen(4)">

        <div class="flex-1 text-center strip-content">

          <h4 class="strip-label">Adventure</h4>

          <div class="strip-image">
            <!-- Picture taken by Sheri Kerr -->
            <img src="/img/jetski-day.jpg" alt="jetski adventure">
          </div>

        </div>

        <div class="flex-1 text-center strip-content">

          <i class="fi flaticon-hiker large strip-icon"></i>

          <div class="strip-paragraph">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>

        </div>

      </div>

    </div>
  </div>

  <div id="my-work" class="row my-work">
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

        @foreach ($experiences as $experience)
          <div class="flex-1 text-center menu-slot">
            <a href="/experience/{{ $experience->id }}">
              <div class="menu-option mx-auto" v-on:mouseOver="setScreenBg('{{ $experience->backgroundImage }}')">
                {{ $experience->brand }} - {{ $experience->title }}
                <br>
                <small class="text-uppercase">{{ $experience->myPart }}</small>
              </div>
            </a>
          </div>
        @endforeach

      </div>
      <!-- END MENU -->

    </div>
  </div>

  <div id="contact-me" class="row contact-me">
    <div class="w-100 d-flex flex-column text-center">

      <!-- MAIN TITLE -->
      <h2 class="main-title font-weight-bold">Contact Me</h2>

      <!-- DESCRIPTION TEXT -->
      <span class="main-email"><i class="fi flaticon-email"></i><a href="mailto:contact@jakekillpack.com">contact@jakekillpack.com</a></span>

      <p>Need help with a project? Looking to hire? Fill in the form or use the link above to send me a message.</p>

      <p>I'll get back to you in a flash!</p>

      <!-- EMAIL FORM -->
      <form class="email-form text-left" action="/send" method="post">

        <div class="form-row">

          <!-- NAME -->
          <div class="form-group col simple-set">

            <label for="inputName">Name: </label>

            @if ($errors->has('name'))
              <div class="alert alert-danger">
                <ul>
                  @foreach($errors->get('name') as $error)
                    <li>{{ $error }}</li>
                  @endforeach
                </ul>
              </div>
            @endif

            <input id="inputName" class="form-control" type="text" name="name" placeholder="John Doe" value="{{ old('name') }}" required>

          </div>

          <!-- EMAIL -->
          <div class="form-group col simple-set">

            <label for="inputEmail">Return Email: </label>

            @if ($errors->has('email'))
              <div class="alert alert-danger">
                <ul>
                  @foreach($errors->get('email') as $error)
                    <li>{{ $error }}</li>
                  @endforeach
                </ul>
              </div>
            @endif

            <input id="inputEmail" class="form-control" type="email" name="email" placeholder="johndoe@example.com" value="{{ old('email') }}" required>

          </div>

        </div>

        <!-- BODY -->
        <div class="form-group">

          <label for="inputBody">How can I help?</label>

          @if ($errors->has('body'))
            <div class="alert alert-danger">
              <ul>
                @foreach($errors->get('body') as $error)
                  <li>{{ $error }}</li>
                @endforeach
              </ul>
            </div>
          @endif

          <textarea id="inputBody" class="form-control" name="body" rows="10" cols="40" placeholder="John Doe's story..." required>{{ old('body') }}</textarea>

        </div>

        {{ csrf_field() }}

        <button type="submit" class="btn btn-default">Send Message</button>

      </form>
      <!-- END EMAIL FORM -->

    </div>
  </div>

  <div class="row footer">
    <div class="w-100 d-flex flex-column">

      <!-- ICON ATTRIBUTIONS -->
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
          <!-- <li>Phone icon made by <a href="http://www.zurb.com">Zurb</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li> -->
          <li>TV icon made by <a href="http://www.freepik.com">Freepik</a> from <a href="https://www.flaticon.com/">www.flaticon.com</a></li>
        </ul>

      </div>

      <!-- CONTACT INFO -->
      <div class="w-100 d-flex flex-row contact-info text-center">

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

</div>

@endsection
