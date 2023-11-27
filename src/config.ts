import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://ziho.dev",
  author: "ziho",
  desc: "개발 기록",
  title: "ziho.dev",
  ogImage: "og.svg",
  lightAndDarkMode: true,
  postPerPage: 3,
};

export const LOCALE = ["ko-KR"];

export const LOGO_IMAGE = {
  enable: true,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/zih0",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/%EC%A7%80%ED%98%B8-%EC%8B%A0-73783b24b",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:ziho.dev@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: false,
  },
];
