import {siteConfig} from '../data/site';

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  displayTitle?: string;
  author?: string;
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

export type BlogCtaVariant = 'desk' | 'room';

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

export const LOCAL_TEST_BLOG_POST: BlogPost = {
  id: 'local-test-article',
  slug: 'article-test-local',
  title: 'Article de test local',
  displayTitle: 'Article de test local pour le blog',
  author: 'Marika',
  excerpt:
    'Un article toujours disponible en local pour vérifier la mise en forme, les CTA et la structure SEO du blog sans dépendre du CMS Webflow.',
  coverImage: '/rooms/la-place-2.webp',
  ogImage: '/rooms/la-place-2.webp',
  seoTitle: 'Article de test local | L’esquisse commune',
  seoDescription:
    'Article de test local pour valider la présentation du blog, les CTA et le rendu des contenus sur esquisse.aidhabitat.fr.',
  publishedAt: '2026-04-08T09:00:00.000Z',
  contentHtml: `
    <p>Ce contenu de test nous permet de vérifier le rendu du blog en local, même lorsque les données Webflow ou les fichiers pré-rendus ne sont pas disponibles.</p>
    <h2>Ce que l’on valide avec cet article</h2>
    <p>La structure de la page, la bannière, le chapô, les blocs de texte, le pied d’article et les appels à l’action sont tous visibles ici. C’est aussi une bonne base pour tester les ajustements de design sans attendre un redeploy.</p>
    <h2>Un support pratique pour les prochaines itérations</h2>
    <p>On peut l’utiliser pour vérifier les gabarits d’articles liés aux bureaux, aux salles de réunion ou à la stratégie SEO locale, tout en gardant un contenu stable et accessible en environnement de développement.</p>
  `,
};

export const LOCAL_TEST_BLOG_SUMMARY = toBlogPostSummary(LOCAL_TEST_BLOG_POST);

export function shouldUseLocalBlogFallback() {
  if (typeof window === 'undefined') return false;
  return import.meta.env?.DEV === true;
}

export function getLocalBlogPosts() {
  return shouldUseLocalBlogFallback() ? [LOCAL_TEST_BLOG_SUMMARY] : [];
}

export function getLocalBlogPostBySlug(slug: string) {
  if (!shouldUseLocalBlogFallback()) {
    return null;
  }

  return slug === LOCAL_TEST_BLOG_POST.slug ? LOCAL_TEST_BLOG_POST : null;
}

export function mergeWithLocalBlogPosts(posts: BlogPostSummary[]) {
  if (!shouldUseLocalBlogFallback()) {
    return posts;
  }

  const nextPosts = [...posts];

  if (!nextPosts.some((post) => post.slug === LOCAL_TEST_BLOG_SUMMARY.slug)) {
    nextPosts.unshift(LOCAL_TEST_BLOG_SUMMARY);
  }

  return nextPosts;
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
    author: post.author,
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

function getAbsoluteUrl(path: string) {
  return new URL(path, siteConfig.siteUrl).toString();
}

function getStructuredAuthor(author?: string) {
  const authorName = author?.trim() || 'Marika';

  return {
    '@type': authorName === siteConfig.brand || authorName === 'L’esquisse commune' ? 'Organization' : 'Person',
    name: authorName,
  };
}

function getStructuredPublisher() {
  return {
    '@type': 'Organization',
    name: siteConfig.brand,
    url: siteConfig.siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: getAbsoluteUrl('/favicon-logo.svg'),
    },
  };
}

export function getBlogIndexJsonLd(posts: BlogPostSummary[]) {
  return [
    {
      id: 'blog-breadcrumb',
      data: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: getAbsoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: getAbsoluteUrl(getBlogIndexPath()),
          },
        ],
      },
    },
    {
      id: 'blog-index',
      data: {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: `Blog | ${siteConfig.brand}`,
        url: getAbsoluteUrl(getBlogIndexPath()),
        description: getBlogIndexSeo().description,
        publisher: getStructuredPublisher(),
        blogPost: posts.map((post) => ({
          '@type': 'BlogPosting',
          headline: post.displayTitle ?? post.title,
          url: getAbsoluteUrl(getBlogPostPath(post.slug)),
          datePublished: post.publishedAt,
          author: getStructuredAuthor(post.author),
          image: post.ogImage ?? post.coverImage,
        })),
      },
    },
  ] as const;
}

export function getBlogPostJsonLd(post: BlogPost) {
  const headline = post.displayTitle ?? post.title;
  const canonicalUrl = getAbsoluteUrl(getBlogPostPath(post.slug));

  return [
    {
      id: 'blog-post-breadcrumb',
      data: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: getAbsoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: getAbsoluteUrl(getBlogIndexPath()),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: headline,
            item: canonicalUrl,
          },
        ],
      },
    },
    {
      id: 'blog-post',
      data: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline,
        description: post.seoDescription ?? post.excerpt,
        mainEntityOfPage: canonicalUrl,
        url: canonicalUrl,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        author: getStructuredAuthor(post.author),
        publisher: getStructuredPublisher(),
        image: post.ogImage ?? post.coverImage,
      },
    },
  ] as const;
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

export function getReadingTimeMinutes(contentHtml: string, wordsPerMinute = 200) {
  const text = stripHtml(contentHtml);
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function getExcerptFallback(contentHtml: string, maxLength = 180) {
  const text = stripHtml(contentHtml);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function getBlogCtaVariant(post: Pick<BlogPost, 'slug' | 'title' | 'excerpt' | 'contentHtml'>): BlogCtaVariant {
  const haystack = [post.slug, post.title, post.excerpt, stripHtml(post.contentHtml)]
    .join(' ')
    .toLowerCase();

  if (/(salle|salles|réunion|reunion|atelier|séminaire|seminaire|presentation|présentation)/.test(haystack)) {
    return 'room';
  }

  return 'desk';
}
