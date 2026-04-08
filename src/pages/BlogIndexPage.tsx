import {ArrowRight} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {siteConfig} from '../data/site';
import {
  formatBlogDate,
  getBlogIndexDataUrl,
  getBlogIndexSeo,
  getBlogPostPath,
  getInitialBlogIndexData,
  type BlogPostSummary,
} from '../lib/blog';
import {useBlogPageData} from '../lib/blog-context';
import {applySeo} from '../lib/seo';

export function BlogIndexPage() {
  const contextData = useBlogPageData();
  const contextPosts = contextData?.kind === 'index' ? contextData.posts : null;
  const [posts, setPosts] = useState<BlogPostSummary[]>(() => contextPosts ?? getInitialBlogIndexData() ?? []);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>(
    contextPosts || getInitialBlogIndexData() ? 'idle' : 'loading',
  );

  useEffect(() => {
    applySeo(getBlogIndexSeo());
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      return;
    }

    let ignore = false;
    setStatus('loading');

    fetch(getBlogIndexDataUrl())
      .then((response) => {
        if (!response.ok) {
          throw new Error('Blog index unavailable');
        }

        return response.json() as Promise<BlogPostSummary[]>;
      })
      .then((nextPosts) => {
        if (!ignore) {
          setPosts(nextPosts);
          setStatus('idle');
        }
      })
      .catch(() => {
        if (!ignore) {
          setStatus('error');
        }
      });

    return () => {
      ignore = true;
    };
  }, [posts.length]);

  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-[1400px] px-6 pb-20 pt-16 md:px-12 md:pb-24 md:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Blog</p>
          <h1 className="mt-5 font-serif text-4xl font-black leading-tight text-gray-900 md:text-6xl">
            Ressources autour de la location de bureaux à Rennes
          </h1>
          <p className="mt-6 text-base leading-relaxed text-gray-600 md:text-lg">
            Conseils, actualités et retours d’expérience sur les bureaux à louer près de Rennes, les espaces de
            travail et l’organisation de vos réunions professionnelles.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          {status === 'error' ? (
            <div className="rounded-[2rem] border border-red-100 bg-white p-8 text-center text-red-600 shadow-sm">
              Les articles du blog ne sont pas disponibles pour le moment.
            </div>
          ) : null}

          {status === 'loading' && posts.length === 0 ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({length: 3}).map((_, index) => (
                <div key={`blog-skeleton-${index}`} className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
                  <div className="aspect-[4/3] animate-pulse bg-gray-100" />
                  <div className="space-y-4 p-8">
                    <div className="h-4 w-24 animate-pulse rounded-full bg-gray-100" />
                    <div className="h-7 w-3/4 animate-pulse rounded-full bg-gray-100" />
                    <div className="h-4 w-full animate-pulse rounded-full bg-gray-100" />
                    <div className="h-4 w-5/6 animate-pulse rounded-full bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => {
                const publishedAt = formatBlogDate(post.publishedAt);

                return (
                  <article
                    key={post.id}
                    className="group overflow-hidden rounded-[2rem] bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link to={getBlogPostPath(post.slug)} className="block h-full">
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-secondary/30 px-10 text-center text-sm font-medium text-primary">
                            {siteConfig.brand}
                          </div>
                        )}
                      </div>

                      <div className="p-8">
                        {publishedAt ? (
                          <p className="text-sm font-medium text-primary/75">{publishedAt}</p>
                        ) : null}
                        <h2 className="mt-3 font-serif text-3xl font-black leading-tight text-gray-900">{post.title}</h2>
                        <p className="mt-4 text-base leading-relaxed text-gray-600">{post.excerpt}</p>
                        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                          Lire l’article
                          <ArrowRight size={16} />
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

