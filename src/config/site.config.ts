const PUBLIC_SITE_URL = import.meta.env.PUBLIC_SITE_URL;

export const SITE = {
  website: PUBLIC_SITE_URL,
  author: 'Aayushmaan Soni',
  profile: 'https://www.aayushmaansoni.com',
  title: 'Aayushmaan Soni',
  description:
    'Writing about software, systems, and whatever else sparks my curiosity.',
  ogImage: 'og.png',
  browserStorage: {
    backUrl: 'ams/blog/back-url',
    theme: 'ams/blog/theme',
  },
  postPerIndex: 4,
  postPerPage: {
    blogs: 4,
    shortReads: 4,
    tags: 4,
  },
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showScrollAtTopAt: 0.25, // 25% of scroll
  dir: 'ltr', // "rtl" | "auto"
  lang: 'en',
  timezone: 'Asia/Kolkata', // Timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  twitterHandle: '@aayushmaan5oni',
} as const;
