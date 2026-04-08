import {siteConfig} from '../data/site';

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  displayTitle?: string;
  excerpt: string;
  coverImage?: string;
  ogImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
};

export type BlogPost = BlogPostSummary & {
  contentHtml: string;
};

export type BlogPageData =
  | {
      kind: 'index';
      posts: BlogPostSummary[];
    }
  | {
      kind: 'post';
      post: BlogPost;
    };

declare global {
  interface Window {
    __BLOG_DATA__?: BlogPageData;
  }
}

export function getBlogIndexPath() {
  return '/blog';
}

export function getBlogPostPath(slug: string) {
  return `/blog/${slug}`;
}

export function getBlogIndexDataUrl() {
  return '/blog-data/index.json';
}

export function getBlogPostDataUrl(slug: string) {
  return `/blog-data/posts/${slug}.json`;
}

export function getInitialBlogPageData() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.__BLOG_DATA__ ?? null;
}

export function getInitialBlogIndexData() {
  const data = getInitialBlogPageData();
  return data?.kind === 'index' ? data.posts : null;
}

export function getInitialBlogPostData(slug: string) {
  const data = getInitialBlogPageData();
  return data?.kind === 'post' && data.post.slug === slug ? data.post : null;
}

export function toBlogPostSummary(post: BlogPost): BlogPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    displayTitle: post.displayTitle,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    ogImage: post.ogImage,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    publishedAt: post.publishedAt,
  };
}

export function getBlogIndexSeo() {
  return {
    title: `Blog | ${siteConfig.brand}`,
    description:
      'Conseils, actualités et ressources autour de la location de bureaux à Rennes, des espaces de travail et des salles de réunion.',
    canonicalPath: getBlogIndexPath(),
    ogType: 'website',
  } as const;
}

export function getBlogPostSeo(post: BlogPost) {
  return {
    title: post.seoTitle ?? `${post.displayTitle ?? post.title} | ${siteConfig.brand}`,
    description: post.seoDescription ?? post.excerpt,
    canonicalPath: getBlogPostPath(post.slug),
    ogType: 'article',
    ogImage: post.ogImage ?? post.coverImage,
  } as const;
}

export function formatBlogDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getExcerptFallback(contentHtml: string, maxLength = 180) {
  const text = stripHtml(contentHtml);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
}
