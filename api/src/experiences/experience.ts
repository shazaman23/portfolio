// One work experience, as content/experiences.json defines it and the API
// returns it. In DynamoDB each item also carries kind: "experience", which
// tells it apart from the contact-send counters in the same table.
export interface Experience {
  id: string;
  brand: string;
  title: string;
  problem: string;
  description: string;
  // null when the site no longer runs; the frontend says so instead of linking.
  url: string | null;
  myPart: string;
  // File name under /assets/img/screenshots/{desktop,mobile}/.
  screenshot: string;
  demoText: string | null;
  noMobile: boolean;
}

export const EXPERIENCE_KIND = 'experience';
