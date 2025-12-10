import type { Metadata } from 'next';
import { Landmark } from 'lucide-react';
import { Suspense } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { PageContent } from './page-content';
import { getCachedInitialCompetitions } from '@/lib/data';

export const metadata: Metadata = {
  title: 'المباريات العمومية - آخر إعلانات التوظيف في القطاع العام',
  description: 'تصفح أحدث إعلانات مباريات التوظيف في القطاع العام بالمغرب. فرص في الوزارات، الجماعات المحلية، والمؤسسات العمومية.',
};

function CompetitionListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-muted rounded-lg h-48 animate-pulse" />
      ))}
    </div>
  );
}

export default async function CompetitionsPage({ searchParams }: { searchParams: { q?: string } }) {
  const hasFilters = !!searchParams.q;
  const initialCompetitions = !hasFilters ? await getCachedInitialCompetitions() : [];

  return (
    <>
      <MobilePageHeader title="المباريات العمومية" sticky={false}>
        <Landmark className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Landmark}
        title="المباريات العمومية"
        description="تصفح أحدث إعلانات التوظيف والمباريات في القطاع العام."
      />
      <Suspense fallback={<div className="container"><CompetitionListSkeleton /></div>}>
        <PageContent initialCompetitions={initialCompetitions} />
      </Suspense>
    </>
  );
}
