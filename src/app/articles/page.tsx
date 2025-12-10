import type { Metadata } from 'next';
import { Newspaper } from 'lucide-react';
import { Suspense } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { PageContent } from './page-content';
import { getCachedInitialArticles } from '@/lib/data';

export const metadata: Metadata = {
  title: 'مقالات لنموك المهني - نصائح وإرشادات',
  description: 'مجموعة من المقالات المختارة لمساعدتك على تطوير مهاراتك، النجاح في مسيرتك المهنية، ومواكبة آخر تطورات سوق العمل والربح من الإنترنت.',
};

function ArticlesListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
            <div className="h-[125px] w-full rounded-xl bg-muted animate-pulse" />
            <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            </div>
        </div>
      ))}
    </div>
  );
}

export default async function ArticlesPage() {
  const initialArticles = await getCachedInitialArticles();

  return (
    <>
      <MobilePageHeader title="مقالات">
        <Newspaper className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      
      <DesktopPageHeader
        icon={Newspaper}
        title="مقالات لنموك المهني"
        description="نقدم لك مجموعة من المقالات المختارة بعناية لمساعدتك على تطوير مهاراتك، والنجاح في مسيرتك المهنية، ومواكبة آخر تطورات سوق العمل."
      />
      <div className="container mx-auto max-w-5xl px-4 pb-8">
        <Suspense fallback={<ArticlesListSkeleton />}>
          <PageContent initialArticles={initialArticles} />
        </Suspense>
      </div>
    </>
  );
}
