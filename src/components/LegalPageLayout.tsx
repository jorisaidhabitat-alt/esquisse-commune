import type {ReactNode} from 'react';
import {useEffect} from 'react';
import {applySeo} from '../lib/seo';

export function LegalPageLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const slug = title === 'Mentions légales'
      ? '/mentions-legales'
      : title === 'Politique de confidentialité'
        ? '/politique-confidentialite'
        : '/cgv';

    applySeo({
      title: `${title} | L'esquisse commune`,
      description,
      canonicalPath: slug,
      ogType: 'article',
    });
  }, [description, title]);

  return (
    <main className="bg-gray-50">
      <section className="mx-auto max-w-[1000px] px-6 py-16 md:px-12 md:py-20">
        <div className="mb-10">
          <h1 className="font-serif text-4xl font-black text-gray-900 md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base text-gray-600 md:text-lg">{description}</p>
        </div>
        <div className="space-y-8 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm md:p-12">
          {children}
        </div>
      </section>
    </main>
  );
}
