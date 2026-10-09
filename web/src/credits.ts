// Flaticon asks for credit for each icon used. Each page credits the icons
// it shows, in two columns.

export interface Credit {
  icon: string;
  author: string;
  href: string;
}

const freepik = (icon: string): Credit => ({
  icon,
  author: 'Freepik',
  href: 'http://www.freepik.com',
});

const credits = {
  books: {
    icon: 'Books',
    author: 'Zlatko Najdenovski',
    href: 'https://www.flaticon.com/authors/zlatko-najdenovski',
  },
  cellphone: freepik('Cellphone'),
  computer: {
    icon: 'Computer monitor',
    author: 'Icon Works',
    href: 'http://icon-works.com',
  },
  email: { icon: 'Email', author: 'Dave Gandy', href: 'http://fontawesome.io' },
  gamepad: freepik('Gamepad'),
  github: freepik('GitHub'),
  hiker: freepik('Hiker'),
  home: {
    icon: 'Home',
    author: 'Webalys Freebies',
    href: 'http://www.streamlineicons.com/',
  },
  linkedin: freepik('Linkedin'),
  tv: freepik('TV'),
} satisfies Record<string, Credit>;

export const homeCredits: Credit[][] = [
  [
    credits.books,
    credits.computer,
    credits.email,
    credits.gamepad,
    credits.github,
  ],
  [credits.hiker, credits.home, credits.linkedin, credits.tv],
];
export const experienceCredits: Credit[][] = [
  [credits.cellphone, credits.email],
  [credits.github, credits.linkedin],
];
