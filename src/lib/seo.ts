type SeoInput = {
  title: string;
  description: string;
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
};

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

export function applySeo({
  title,
  description,
  canonicalPath = '/',
  ogTitle = title,
  ogDescription = description,
  ogType = 'website',
  ogImage,
}: SeoInput) {
  const canonicalUrl = new URL(canonicalPath, window.location.origin).toString();

  document.title = title;
  upsertMeta('meta[name="description"]', {name: 'description', content: description});
  upsertMeta('meta[property="og:title"]', {property: 'og:title', content: ogTitle});
  upsertMeta('meta[property="og:description"]', {property: 'og:description', content: ogDescription});
  upsertMeta('meta[property="og:type"]', {property: 'og:type', content: ogType});
  upsertMeta('meta[property="og:url"]', {property: 'og:url', content: canonicalUrl});
  upsertMeta('meta[name="twitter:card"]', {name: 'twitter:card', content: 'summary_large_image'});
  upsertMeta('meta[name="twitter:title"]', {name: 'twitter:title', content: ogTitle});
  upsertMeta('meta[name="twitter:description"]', {name: 'twitter:description', content: ogDescription});
  if (ogImage) {
    upsertMeta('meta[property="og:image"]', {property: 'og:image', content: ogImage});
    upsertMeta('meta[name="twitter:image"]', {name: 'twitter:image', content: ogImage});
  }

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }

  canonical.setAttribute('href', canonicalUrl);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderSeoTags(
  {
    title,
    description,
    canonicalPath = '/',
    ogTitle = title,
    ogDescription = description,
    ogType = 'website',
    ogImage,
  }: SeoInput,
  origin: string,
) {
  const canonicalUrl = new URL(canonicalPath, origin).toString();

  return [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(ogDescription)}" />`,
    `<meta property="og:type" content="${escapeHtml(ogType)}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(ogTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(ogDescription)}" />`,
    ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function applyJsonLd(id: string, data: Record<string, unknown>) {
  let script = document.head.querySelector<HTMLScriptElement>(`script[data-seo-id="${id}"]`);

  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seoId = id;
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}
