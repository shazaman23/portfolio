// URLs for media in the assets bucket, which CloudFront serves at /assets/*
// (see "Asset Strategy" in docs/action-plans/serverless-rebuild.md).

export const aboutPhoto = (name: string) => `/assets/img/about/${name}`;

export const desktopScreenshot = (name: string) =>
  `/assets/img/screenshots/desktop/${name}`;

export const mobileScreenshot = (name: string) =>
  `/assets/img/screenshots/mobile/${name}`;
