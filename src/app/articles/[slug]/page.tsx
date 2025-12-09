import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getCachedArticleBySlug, getArticles } from '@/lib/data';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { User, Newspaper } from 'lucide-react';
import type { Metadata } from 'next';
import { ArticleCard } from '../article-card';
import { Separator } from '@/components/ui/separator';
import type { Article } from '@/lib/types';

interface Props {
  params: { slug: string };
}

async function getArticle(slug: string): Promise<Article | null> {
  return await getCachedArticleBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);
  const baseUrl = 'https://www.tawzifak.com';
  const siteThumbnail = 'https://i.postimg.cc/MH0BfvFB/og-image.jpg';

  if (!article) {
    return {
      title: 'المقال غير موجود',
      description: 'لم نتمكن من العثور على المقال الذي تبحث عنه.',
      openGraph: { images: [{ url: siteThumbnail }] },
      twitter: { images: [siteThumbnail] }
    };
  }

  const articleDate = article.createdAt
    ? article.createdAt.toDate()
    : article.date
      ? new Date(article.date)
      : new Date();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/articles/${article.slug}`,
    },
    headline: article.title,
    description: article.summary,
    image: article.imageUrl,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'توظيفك',
      logo: {
        '@type': 'ImageObject',
        url: siteThumbnail,
      },
    },
    datePublished: articleDate.toISOString(),
    dateModified: articleDate.toISOString(),
  };

  return {
    title: article.title,
    description: article.summary,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    robots: 'index, follow',
    openGraph: {
      title: article.title,
      description: article.summary,
      images: [
        {
          url: article.imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      url: `${baseUrl}/articles/${article.slug}`,
      siteName: 'توظيفك',
      type: 'article',
      publishedTime: articleDate.toISOString(),
      authors: [article.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: [article.imageUrl],
    },
    other: {
      'application/ld+json': JSON.stringify(articleJsonLd, null, 2)
    }
  };
}

// تحويل أي رابط موجود بصيغة "نص" (url:الرابط) إلى رابط قابل للنقر
const linkify = (text: string) => {
  // دعم الصيغتين: القديمة (الرابط مباشرة) والجديدة ("النص" (url:الرابط))
  const regex = /(?:("([^"]+)"\s*\(url:([^\s)]+)\))|((https?:\/\/[^\s]+)))/g;
  let lastIndex = 0;
  const elements: React.ReactNode[] = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    let displayText, url;

    if (match[1]) {
      // الصيغة الجديدة: "النص" (url:الرابط)
      displayText = match[2];
      url = match[3];
    } else {
      // الصيغة القديمة: الرابط مباشرة
      displayText = match[4];
      url = match[4];
    }

    elements.push(
      <a 
        key={lastIndex} 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-600 font-medium text-[17px] hover:text-blue-800 no-underline break-words"
      >
        {displayText}
      </a>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }
  return elements;
};

// دالة renderContent لدعم العناوين والقوائم والفقرات
const renderContent = (content: string) => {
  const contentBlocks = content.split('\n').map(p => p.trim());
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="list-disc list-outside ms-6 mb-4 space-y-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="break-words">{linkify(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  contentBlocks.forEach((line, i) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(`ul-${i}`);
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList(`ul-${i}`);
      elements.push(
        <h2 key={`h2-${i}`} className="text-2xl font-bold mt-6 mb-3 text-green-600">
          {trimmed.replace(/^###\s/, '')}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('#### ')) {
      flushList(`ul-${i}`);
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg font-bold mt-4 mb-3 text-gray-800 dark:text-gray-200">
          {trimmed.replace(/^####\s/, '')}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.replace(/^- /, ''));
      return;
    }

    flushList(`ul-${i}`);
    elements.push(
      <p key={`p-${i}`} className="mb-4 text-base md:text-lg leading-relaxed break-words">{linkify(trimmed)}</p>
    );
  });

  flushList('ul-end');
  return elements;
};

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const { data: latestArticles } = await getArticles({ limit: 4 });
  const relatedArticles = latestArticles
    .filter(a => a.id !== article.id && a.slug !== article.slug)
    .slice(0, 3);

  return (
    <>
      <MobilePageHeader title="مقالات">
        <Newspaper className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <div className="container mx-auto max-w-5xl px-4 md:py-8 pb-8">
        <article>
          <Card>
            <CardContent className="p-4 md:p-8">
              <header className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight text-red-600 dark:text-red-500 mb-4">
                  {article.title}
                </h1>
                <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{article.author}</span>
                  </div>
                </div>
              </header>

              <div className="relative h-64 md:h-80 w-full mb-8 rounded-lg overflow-hidden">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority
                />
              </div>

              <div className="prose-p:leading-relaxed prose-lg max-w-none dark:prose-invert">
                {renderContent(article.content)}
              </div>
            </CardContent>
          </Card>
        </article>

        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <Separator className="my-8" />
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              مقالات قد تعجبك أيضاً
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard key={relatedArticle.slug} article={relatedArticle} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export async function generateStaticParams() {
  const { data } = await getArticles({ limit: 24 }); 

  return data.map(article => ({ slug: article.slug }));
}
