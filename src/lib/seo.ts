type SeoInput = {
  title: string;
  description: string;
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
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
}: SeoInput) {
  document.title = title;
  upsertMeta('meta[name="description"]', {name: 'description', content: description});
  upsertMeta('meta[property="og:title"]', {property: 'og:title', content: ogTitle});
  upsertMeta('meta[property="og:description"]', {property: 'og:description', content: ogDescription});
  upsertMeta('meta[property="og:type"]', {property: 'og:type', content: ogType});
  upsertMeta('meta[name="twitter:card"]', {name: 'twitter:card', content: 'summary_large_image'});
  upsertMeta('meta[name="twitter:title"]', {name: 'twitter:title', content: ogTitle});
  upsertMeta('meta[name="twitter:description"]', {name: 'twitter:description', content: ogDescription});

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }

  canonical.setAttribute('href', new URL(canonicalPath, window.location.origin).toString());
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
