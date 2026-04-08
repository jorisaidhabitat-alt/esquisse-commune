import {ArrowLeft} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {
  formatBlogDate,
  getBlogCtaVariant,
  getBlogIndexPath,
  getBlogPostJsonLd,
  getLocalBlogPostBySlug,
  getBlogPostDataUrl,
  getBlogPostSeo,
  getInitialBlogPostData,
  getReadingTimeMinutes,
  type BlogPost,
} from '../lib/blog';
import {useBlogPageData} from '../lib/blog-context';
import {applyJsonLd, applySeo} from '../lib/seo';

export function BlogPostPage() {
  const {slug = ''} = useParams();
  const contextData = useBlogPageData();
  const contextPost = contextData?.kind === 'post' && contextData.post.slug === slug ? contextData.post : null;
  const [post, setPost] = useState<BlogPost | null>(() => contextPost ?? getInitialBlogPostData(slug) ?? getLocalBlogPostBySlug(slug));
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>(
    contextPost || getInitialBlogPostData(slug) || getLocalBlogPostBySlug(slug) ? 'idle' : 'loading',
  );

  useEffect(() => {
    if (post) {
      applySeo(getBlogPostSeo(post));
      getBlogPostJsonLd(post).forEach(({id, data}) => applyJsonLd(id, data));
    }
  }, [post]);

  useEffect(() => {
    if (!slug || post) {
      return;
    }

    let ignore = false;
    setStatus('loading');

    fetch(getBlogPostDataUrl(slug))
      .then((response) => {
        if (!response.ok) {
          throw new Error('Blog post unavailable');
        }

        return response.json() as Promise<BlogPost>;
      })
      .then((nextPost) => {
        if (!ignore) {
          setPost(nextPost);
          setStatus('idle');
        }
      })
      .catch(() => {
        if (!ignore) {
          const localPost = getLocalBlogPostBySlug(slug);
          if (localPost) {
            setPost(localPost);
            setStatus('idle');
            return;
          }

          setStatus('error');
        }
      });

    return () => {
      ignore = true;
    };
  }, [post, slug]);

  if (status === 'error') {
    return (
      <main className="bg-gray-50">
        <section className="mx-auto max-w-[920px] px-6 py-20 md:px-12 md:py-24">
          <Link to={getBlogIndexPath()} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft size={16} />
            Retour au blog
          </Link>
          <div className="mt-8 rounded-[2rem] bg-white p-8 shadow-sm md:p-12">
            <h1 className="font-serif text-4xl font-black text-gray-900">Article introuvable</h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              Cet article n’est pas disponible ou n’a pas encore été publié.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="bg-gray-50">
        <section className="mx-auto max-w-[920px] px-6 py-20 md:px-12 md:py-24">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm md:p-12">
            <div className="h-4 w-32 animate-pulse rounded-full bg-gray-100" />
            <div className="mt-6 h-10 w-3/4 animate-pulse rounded-full bg-gray-100" />
            <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-gray-100" />
            <div className="mt-3 h-4 w-5/6 animate-pulse rounded-full bg-gray-100" />
          </div>
        </section>
      </main>
    );
  }

  const publishedAt = formatBlogDate(post.publishedAt);
  const readingTimeMinutes = getReadingTimeMinutes(post.contentHtml);
  const author = 'Marika';
  const ctaVariant = getBlogCtaVariant(post);
  const ctaContent =
    ctaVariant === 'room'
      ? {
          eyebrow: 'Passer à l’action',
          title: 'Réservez votre salle de réunion directement',
          description:
            'Choisissez la formule adaptée et envoyez votre demande depuis le formulaire de réservation de la page principale.',
          primaryHref: '/#reservation',
          primaryLabel: 'Réserver une salle',
          highlights: ['Tarifs clairs', 'Options flexibles', 'Demande rapide'],
        }
      : {
          eyebrow: 'Passer à l’action',
          title: 'Demandez une visite de bureau directement',
          description:
            'Découvrez nos bureaux disponibles et envoyez votre demande depuis le formulaire de réservation de la page principale.',
          primaryHref: '/#reservation',
          primaryLabel: 'Demander une visite',
          highlights: ['Bureaux privatifs', 'Charges comprises', 'Visite sur rendez-vous'],
        };

  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-[1400px] px-6 py-20 md:px-12 md:py-24">
        <Link to={getBlogIndexPath()} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft size={16} />
          Retour au blog
        </Link>

        <div className="mt-8">
          <article className="overflow-hidden rounded-[2.4rem] bg-white shadow-sm">
            <div className="px-6 py-8 md:px-12 md:py-12">
              <h1 className="mt-3 text-center font-serif text-4xl font-black leading-tight text-gray-900 md:text-6xl">
                {post.displayTitle ?? post.title}
              </h1>
              {post.excerpt ? (
                <p className="mx-auto mt-6 max-w-4xl text-center text-lg leading-relaxed text-gray-600 md:text-xl">
                  {post.excerpt}
                </p>
              ) : null}
            </div>

{post.coverImage ? (
              <div className="bg-white px-6 pb-6 md:px-12 md:pb-8">
                <div className="relative aspect-[4/3.25] overflow-hidden rounded-[2rem] md:aspect-[16/5.8]">
                  <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" loading="eager" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/45 via-transparent to-transparent" />
                <div className="absolute bottom-5 right-5 max-w-[calc(100%-2.5rem)] rounded-full bg-primary px-4 py-2 text-right text-xs font-medium text-white shadow-sm md:bottom-7 md:right-7 md:px-5 md:py-2.5 md:text-sm">
                  {publishedAt}
                  {publishedAt && readingTimeMinutes ? ' • ' : ''}
                  {readingTimeMinutes ? `${readingTimeMinutes} min de lecture` : ''}
                  {(publishedAt || readingTimeMinutes) && author ? ' • ' : ''}
                    {author}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="px-6 py-8 md:px-12 md:py-12">
              <div
                className="blog-prose text-gray-700"
                dangerouslySetInnerHTML={{__html: post.contentHtml}}
              />
            </div>
          </article>

          <div className="mx-auto mt-10 max-w-[58rem] overflow-hidden rounded-[2rem] bg-primary text-white shadow-sm">
            <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="px-6 py-8 text-center md:px-7 md:py-8 md:text-left">
                <h2 className="font-serif text-3xl font-black leading-tight md:text-[2rem]">{ctaContent.title}</h2>

                <a
                  href={ctaContent.primaryHref}
                  className="mt-6 block md:hidden"
                >
                  <div className="relative mx-auto aspect-square w-full max-w-[21rem] overflow-hidden rounded-[1.5rem] bg-white/10">
                    <img
                      src="/rooms/la-place-1.webp"
                      alt="Salle La Place"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-primary/10 to-primary/35" />
                  </div>
                </a>

                <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/82 md:mx-0 md:text-[15px]">
                  {ctaContent.description}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3 md:justify-start">
                  {ctaContent.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="inline-flex items-center rounded-full bg-white/14 px-4 py-2 text-xs font-semibold tracking-[0.08em] text-white/92 ring-1 ring-white/16"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex justify-center md:justify-start">
                  <a
                    href={ctaContent.primaryHref}
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
                  >
                    {ctaContent.primaryLabel}
                  </a>
                </div>
              </div>

              <div className="hidden items-center justify-center p-5 md:flex md:pt-3 md:pr-7 md:pb-3 md:pl-2">
                <a
                  href={ctaContent.primaryHref}
                  className="block"
                >
                  <div className="relative aspect-square w-full max-w-[19.5rem] overflow-hidden rounded-[1.35rem] bg-white/10 md:max-h-[calc(100%-1.5rem)] md:w-auto">
                    <img
                      src="/rooms/la-place-1.webp"
                      alt="Salle La Place"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-primary/10 to-primary/35" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
