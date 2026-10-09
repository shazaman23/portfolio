import { Fragment, useState } from 'react';
import { aboutPhoto } from '../paths';

interface Strip {
  label: string;
  icon: string;
  photo: string;
  alt: string;
  text: string;
}

const strips: Strip[] = [
  {
    label: 'Family',
    icon: 'flaticon-home',
    // This picture was taken by my awesome Mom, Kathleen Killpack
    photo: 'family-cabin.webp',
    alt: 'family picture',
    text: 'My family is probably the biggest contributing factor to who I am today. I hail from a family of 2 loving parents and 7 awesome siblings. My parents taught me invaluable lessons in how to manage my time well and helped me see that I could do almost anything with the proper mindset and determination. My brothers and sisters taught me how to have fun and how to work well with others (a trait that did not come naturally to me as a child). We still regularly meet to share food, laughs, and fun and for that I consider myself to be exceedingly lucky.',
  },
  {
    label: 'Gaming',
    icon: 'flaticon-gamepad',
    // I took this picture myself! Crazy, huh? Phone cameras are pretty great...
    photo: 'betrayal-game-slim.webp',
    alt: 'board game',
    text: 'Gaming is at the core of who I am. I love games of all shapes and sizes. Be it dice, cards, board games, word games, role-playing games, or video games, a good game is my idea of a good time. While I frequently play games as a way to unwind or relax with friends and family, I feel that my gaming habits have also contributed to my professional skillset. Each game is just another problem to be solved or system to be optimized.',
  },
  {
    label: 'Learning',
    icon: 'flaticon-books',
    // This picture was taken by the lovely Nikelle Maughan
    photo: 'studying.webp',
    alt: 'studying',
    text: 'I love learning! (No really... Nerd alert!) One of the things that draws me to the web is the help it provides in my search to learn new, exciting things. The desire to learn drives me in many aspects of my life, but makes a significant impact on my professional life. I find that a job is much more appealing to me if it offers me a chance to learn something new while I create something great.',
  },
  {
    label: 'Movies',
    icon: 'flaticon-tv',
    // Again, I took this picture. Maybe I should go into photography...
    photo: 'popcorn.webp',
    alt: 'popcorn',
    text: "If there's anything I enjoy doing more on my free time than playing a good game, it's watching a good movie or TV show. I regularly go to see new movies in theaters and find new shows to watch on various video streaming services. While I know it's generally a huge waste of time, I love everything about it: the drama, the story-telling, the character development, the social commentary, debating theories on/critiquing the film, etc. It's one of my guilty pleasures.",
  },
  {
    label: 'Adventure',
    icon: 'flaticon-hiker',
    // Picture taken by Sheri Kerr
    photo: 'jetski-day.webp',
    alt: 'jetski adventure',
    text: "I'm not the die-hard, adrenaline junkie type, but I do enjoy a bit of adventure now and again. While I spend most of my waking hours in front of some screen or another, I love spending time outdoors! Some of my favoirte adventurous activities include mountain biking, jetskiing, hiking, roadtripping, or snowboarding. I especially love going on adventures with my closest friends and family members.",
  },
];

export function AboutMe() {
  // One strip open at a time; clicking the open one closes it.
  const [open, setOpen] = useState<number | null>(null);
  // Photos render only once their strip has opened, so the page doesn't
  // download all five up front. They stay rendered after that.
  const [opened, setOpened] = useState<ReadonlySet<number>>(new Set());

  const toggle = (index: number) => {
    setOpen((current) => (current === index ? null : index));
    setOpened((seen) => (seen.has(index) ? seen : new Set(seen).add(index)));
  };

  return (
    <div className="row about-me">
      <div className="w-100 d-flex flex-column">
        <h2 className="main-title text-center font-weight-bold">About Me</h2>

        {strips.map((strip, index) => (
          <Fragment key={strip.label}>
            {index > 0 && <hr />}
            <div
              className={open === index ? 'strip is-open' : 'strip'}
              onClick={() => toggle(index)}
            >
              <div className="flex-1 text-center strip-content">
                <h4 className="strip-label">{strip.label}</h4>
                <div className="strip-image">
                  {opened.has(index) && (
                    <img src={aboutPhoto(strip.photo)} alt={strip.alt} />
                  )}
                </div>
              </div>

              <div className="flex-1 text-center strip-content">
                <i className={`fi ${strip.icon} large strip-icon`}></i>
                <div className="strip-paragraph">{strip.text}</div>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
