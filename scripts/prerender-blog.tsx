import fs from 'node:fs/promises';
import path from 'node:path';
import {renderToString} from 'react-dom/server';
import React from 'react';
import {StaticRouter} from 'react-router-dom';
import App from '../src/App';
import {siteConfig} from '../src/data/site';
import {
  getBlogIndexPath,
  getBlogIndexSeo,
  getBlogPostPath,
  getBlogPostSeo,
  toBlogPostSummary,
  type BlogPageData,
} from '../src/lib/blog';
import {BlogPageDataProvider} from '../src/lib/blog-context';
import {renderSeoTags} from '../src/lib/seo';
import {listBlogPosts} from '../src/lib/webflow.server';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

async function readTemplate() {
  return fs.readFile(path.join(distDir, 'index.html'), 'utf-8');
}

function injectSeo(template: string, seo: Parameters<typeof renderSeoTags>[0]) {
  let html = template;

  const replacements: Array<[RegExp, string]> = [
    [/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`],
    [
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    ],
    [
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(seo.ogTitle ?? seo.title)}" />`,
    ],
    [
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(seo.ogDescription ?? seo.description)}" />`,
    ],
    [
      /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:type" content="${escapeHtml(seo.ogType ?? 'website')}" />`,
    ],
    [
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtml(seo.ogTitle ?? seo.title)}" />`,
    ],
    [
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtml(seo.ogDescription ?? seo.description)}" />`,
    ],
    [
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${new URL(seo.canonicalPath ?? '/', siteConfig.siteUrl).toString()}" />`,
    ],
  ];

  replacements.forEach(([pattern, replacement]) => {
    html = html.replace(pattern, replacement);
  });

  const extraSeo = renderSeoTags(seo, siteConfig.siteUrl)
    .split('\n')
    .filter((line) => line.includes('og:image') || line.includes('twitter:image') || line.includes('og:url'))
    .join('\n');

  if (extraSeo) {
    html = html.replace('</head>', `${extraSeo}\n</head>`);
  }

  return html;
}

function injectAppHtml(template: string, appHtml: string, pageData: BlogPageData) {
  const serializedData = JSON.stringify(pageData).replace(/</g, '\\u003c');
  return template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div><script>window.__BLOG_DATA__=${serializedData};</script>`,
  );
}

async function writeRouteFile(routePath: string, html: string) {
  const filePath =
    routePath === getBlogIndexPath()
      ? path.join(distDir, 'blog', 'index.html')
      : path.join(distDir, routePath.replace(/^\//, ''), 'index.html');

  await fs.mkdir(path.dirname(filePath), {recursive: true});
  await fs.writeFile(filePath, html, 'utf-8');
}

function renderRoute(routePath: string, data: BlogPageData) {
  return renderToString(
    <BlogPageDataProvider value={data}>
      <StaticRouter location={routePath}>
        <App />
      </StaticRouter>
    </BlogPageDataProvider>,
  );
}

async function writeJsonData(posts: Awaited<ReturnType<typeof listBlogPosts>>) {
  const blogDataDir = path.join(distDir, 'blog-data');
  const postDataDir = path.join(blogDataDir, 'posts');

  await fs.mkdir(postDataDir, {recursive: true});
  await fs.writeFile(
    path.join(blogDataDir, 'index.json'),
    JSON.stringify(posts.map(toBlogPostSummary), null, 2),
    'utf-8',
  );

  await Promise.all(
    posts.map((post) =>
      fs.writeFile(path.join(postDataDir, `${post.slug}.json`), JSON.stringify(post, null, 2), 'utf-8'),
    ),
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

async function main() {
  const template = await readTemplate();
  const posts = await listBlogPosts();

  await writeJsonData(posts);

  const indexData: BlogPageData = {
    kind: 'index',
    posts: posts.map(toBlogPostSummary),
  };

  const blogIndexHtml = injectAppHtml(
    injectSeo(template, getBlogIndexSeo()),
    renderRoute(getBlogIndexPath(), indexData),
    indexData,
  );

  await writeRouteFile(getBlogIndexPath(), blogIndexHtml);

  await Promise.all(
    posts.map(async (post) => {
      const postData: BlogPageData = {kind: 'post', post};
      const postHtml = injectAppHtml(
        injectSeo(template, getBlogPostSeo(post)),
        renderRoute(getBlogPostPath(post.slug), postData),
        postData,
      );

      await writeRouteFile(getBlogPostPath(post.slug), postHtml);
    }),
  );
}

main().catch((error) => {
  console.error('[blog] prerender failed');
  console.error(error);
  process.exit(1);
});
