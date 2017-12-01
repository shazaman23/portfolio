@extends('layouts.app')

@section('content')

<div class="content container-fluid homepage">

  <div class="row home">

    <!-- MAIN TITLE -->
    <div class="home-banner">
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
      <div class="strip" v-bind:class="{ 'is-open': stripActive[0] }" v-on:click="toggleIsOpen(0)">

        <div class="flex-1 text-center strip-content">

          <h4 class="strip-label">Family</h4>

          <div class="strip-image">
            <!-- This picture was taken by my awesome Mom, Kathleen Killpack -->
            <img src="/img/family-cabin.jpg" alt="family picture">
          </div>

        </div>

        <div class="flex-1 text-center strip-content">

          <i class="fi flaticon-home large strip-icon"></i>

          <div class="strip-paragraph">
            My family is probably the biggest contributing factor to who I am today.
            I hail from a family of 2 loving parents and 7 awesome siblings. My parents
            taught me invaluable lessons in how to manage my time well and helped me
            see that I could do almost anything with the proper mindset and determination.
            My brothers and sisters taught me how to have fun and how to work well
            with others (a trait that did not come naturally to me as a child). We still
            regularly meet to share food, laughs, and fun and for that I consider myself
            to be exceedingly lucky.
          </div>

        </div>

      </div>

      <hr>

      <!-- GAMING -->
      <div class="strip" v-bind:class="{ 'is-open': stripActive[1] }" v-on:click="toggleIsOpen(1)">

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
            Gaming is at the core of who I am. I love games of all shapes and sizes.
            Be it dice, cards, board games, word games, role-playing games, or video
            games, a good game is my idea of a good time. While I frequently play
            games as a way to unwind or relax with friends and family, I feel that
            my gaming habits have also contributed to my professional skillset. Each
            game is just another problem to be solved or system to be optimized.
          </div>

        </div>

      </div>

      <hr>

      <!-- LEARNING -->
      <div class="strip" v-bind:class="{ 'is-open': stripActive[2] }" v-on:click="toggleIsOpen(2)">

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
            I love learning! (No really... Nerd alert!) One of the things that draws
            me to the web is the help it provides in my search to learn new, exciting
            things. The desire to learn drives me in many aspects of my life, but
            makes a significant impact on my professional life. I find that a job is
            much more appealing to me if it offers me a chance to learn something new
            while I create something great.
          </div>

        </div>

      </div>

      <hr>

      <!-- MOVIES -->
      <div class="strip" v-bind:class="{ 'is-open': stripActive[3] }" v-on:click="toggleIsOpen(3)">

        <div class="flex-1 text-center strip-content">

          <h4 class="strip-label">Movies</h4>

          <div class="strip-image">
            <!-- Again, I took this picture. Maybe I should go into photography... -->
            <img src="/img/popcorn.jpg" alt="popcorn">
          </div>

        </div>

        <div class="flex-1 text-center strip-content">

          <i class="fi flaticon-tv large strip-icon"></i>

          <div class="strip-paragraph">
            If there's anything I enjoy doing more on my free time than playing a good
            game, it's watching a good movie or TV show. I regularly go to see new
            movies in theaters and find new shows to watch on various video streaming
            services. While I know it's generally a huge waste of time, I love everything
            about it: the drama, the story-telling, the character development, the
            social commentary, debating theories on/critiquing the film, etc.
            It's one of my guilty pleasures.
          </div>

        </div>

      </div>

      <hr>

      <!-- ADVENTURE -->
      <div class="strip" v-bind:class="{ 'is-open': stripActive[4] }" v-on:click="toggleIsOpen(4)">

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
            I'm not the die-hard, adrenaline junkie type, but I do enjoy a bit of
            adventure now and again. While I spend most of my waking hours in front
            of some screen or another, I love spending time outdoors! Some of my
            favoirte adventurous activities include mountain biking, jetskiing,
            hiking, roadtripping, or snowboarding. I especially love going on adventures
            with my closest friends and family members.
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
