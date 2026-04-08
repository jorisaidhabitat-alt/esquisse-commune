export type StaticSiteRoute = {
  path: string;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
};

export const STATIC_SITE_ROUTES: StaticSiteRoute[] = [
  {path: '/', changeFrequency: 'weekly', priority: 1},
  {path: '/mentions-legales', changeFrequency: 'yearly', priority: 0.2},
  {path: '/politique-confidentialite', changeFrequency: 'yearly', priority: 0.2},
  {path: '/cgv', changeFrequency: 'yearly', priority: 0.3},
];

