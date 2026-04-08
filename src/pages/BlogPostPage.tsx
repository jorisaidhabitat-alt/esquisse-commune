import {ArrowLeft} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {
  formatBlogDate,
  getBlogIndexPath,
  getBlogPostDataUrl,
  getBlogPostSeo,
  getInitialBlogPostData,
  type BlogPost,
} from '../lib/blog';
import {useBlogPageData} from '../lib/blog-context';
import {applySeo} from '../lib/seo';

export function BlogPostPage() {
  const {slug = ''} = useParams();
  const contextData = useBlogPageData();
  const contextPost = contextData?.kind === 'post' && contextData.post.slug === slug ? contextData.post : null;
  const [post, setPost] = useState<BlogPost | null>(() => contextPost ?? getInitialBlogPostData(slug));
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>(
    contextPost || getInitialBlogPostData(slug) ? 'idle' : 'loading',
  );

  useEffect(() => {
    if (post) {
      applySeo(getBlogPostSeo(post));
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

  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-[920px] px-6 py-20 md:px-12 md:py-24">
        <Link to={getBlogIndexPath()} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft size={16} />
          Retour au blog
        </Link>

        <article className="mt-8 overflow-hidden rounded-[2.4rem] bg-white shadow-sm">
          {post.coverImage ? (
            <div className="aspect-[16/8] overflow-hidden bg-gray-100">
              <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" loading="eager" />
            </div>
          ) : null}

          <div className="px-6 py-8 md:px-12 md:py-12">
            {publishedAt ? (
              <p className="text-sm font-medium text-primary/75">{publishedAt}</p>
            ) : null}
            <h1 className="mt-3 font-serif text-4xl font-black leading-tight text-gray-900 md:text-6xl">
              {post.displayTitle ?? post.title}
            </h1>
            {post.excerpt ? (
              <p className="mt-6 text-lg leading-relaxed text-gray-600 md:text-xl">{post.excerpt}</p>
            ) : null}

            <div
              className="blog-prose mt-10 text-gray-700"
              dangerouslySetInnerHTML={{__html: post.contentHtml}}
            />
          </div>
        </article>
      </section>
    </main>
  );
}
