import type { Metadata } from 'next';
import { Briefcase } from 'lucide-react';
import { Suspense } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { PageContent } from './page-content';
import { getCachedInitialJobs } from '@/lib/data';

export const metadata: Metadata = {
  title: 'عروض العمل - وظائف جديدة في المغرب',
  description: 'اكتشف أحدث الوظائف الجديدة في المغرب مع فرص عمل محدثة يوميًا. تصفح عروض التوظيف المتوفرة في مختلف المدن المغربية واختر الوظيفة التي تناسب مهاراتك وطموحاتك.',
};

function JobListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-muted rounded-lg h-48 animate-pulse" />
      ))}
    </div>
  );
}

export default async function JobsPage({ searchParams }: { searchParams: { q?: string; country?: string; city?: string; category?: string; job?: string } }) {
  const hasFilters = searchParams.q || searchParams.country || searchParams.city || searchParams.category || searchParams.job;
  const initialJobs = !hasFilters ? await getCachedInitialJobs() : [];

  return (
    <>
      <MobilePageHeader title="الوظائف" sticky={false}>
        <Briefcase className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Briefcase}
        title="عروض العمل"
        description="تصفح أحدث عروض العمل المتاحة في مختلف المجالات والقطاعات."
      />
      <Suspense fallback={<div className="container"><JobListSkeleton /></div>}>
        <PageContent initialJobs={initialJobs} />
      </Suspense>
    </>
  );
}
