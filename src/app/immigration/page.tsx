import type { Metadata } from 'next';
import { Plane } from 'lucide-react';
import { Suspense } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { PageContent } from './page-content';
import { getCachedInitialImmigrationPosts } from '@/lib/data';

export const metadata: Metadata = {
  title: 'فرص الهجرة - عمل، دراسة، وتدريب في الخارج',
  description: 'استكشف أحدث إعلانات وفرص الهجرة إلى الخارج. برامج عمل، دراسة، تدريب، وعمل موسمي في دول مثل كندا، أوروبا، والخليج.',
};

function ImmigrationListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-muted rounded-lg h-48 animate-pulse" />
      ))}
    </div>
  );
}

export default async function ImmigrationPage({ searchParams }: { searchParams: { q?: string } }) {
  const hasFilters = !!searchParams.q;
  const initialPosts = !hasFilters ? await getCachedInitialImmigrationPosts() : [];

  return (
    <>
      <MobilePageHeader title="فرص الهجرة" sticky={false}>
        <Plane className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Plane}
        title="فرص الهجرة حول العالم"
        description="استكشف أحدث إعلانات الهجرة للعمل، الدراسة، أو التدريب في مختلف الدول."
      />
      <Suspense fallback={<div className="container"><ImmigrationListSkeleton /></div>}>
        <PageContent initialPosts={initialPosts} />
      </Suspense>
    </>
  );
}
