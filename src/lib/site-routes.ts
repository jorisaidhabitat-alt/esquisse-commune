import {BUSINESS_PAGE_PATHS} from './business-pages';

export type StaticSiteRoute = {
  path: string;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
};

export const STATIC_SITE_ROUTES: StaticSiteRoute[] = [
  {path: '/', changeFrequency: 'weekly', priority: 1},
  {path: BUSINESS_PAGE_PATHS.desks, changeFrequency: 'weekly', priority: 0.9},
  {path: BUSINESS_PAGE_PATHS.rooms, changeFrequency: 'weekly', priority: 0.9},
  {path: '/mentions-legales', changeFrequency: 'yearly', priority: 0.2},
  {path: '/politique-confidentialite', changeFrequency: 'yearly', priority: 0.2},
  {path: '/cgv', changeFrequency: 'yearly', priority: 0.3},
];
