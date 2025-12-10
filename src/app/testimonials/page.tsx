import type { Metadata } from 'next';
import { MessageSquare } from 'lucide-react';
import { Suspense } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { PageContent } from './page-content';
import { getCachedInitialTestimonials } from '@/lib/data';

export const metadata: Metadata = {
  title: 'آراء المستخدمين - ماذا يقولون عن منصة توظيفك',
  description: 'اكتشف آراء وتجارب المستخدمين مع منصة توظيفك. نحن نقدر جميع الملاحظات ونسعى دائمًا لتحسين خدماتنا بناءً على تجاربكم.',
};

function TestimonialsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-[100px] bg-muted rounded animate-pulse" />
              <div className="h-3 w-[70px] bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-4 w-[80px] bg-muted rounded animate-pulse" />
          <div className="h-16 w-full bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default async function TestimonialsPage() {
  const initialTestimonials = await getCachedInitialTestimonials();

  return (
    <>
      <MobilePageHeader title="آراء المستخدمين">
        <MessageSquare className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      
      <DesktopPageHeader
        icon={MessageSquare}
        title="آراء المستخدمين"
        description="نحن نقدر جميع الآراء ونسعى دائمًا لتحسين خدماتنا بناءً على ملاحظاتكم."
      />
        
      <div className="container mx-auto max-w-7xl px-4 pb-28">
        <Suspense fallback={<TestimonialsSkeleton />}>
          <PageContent initialTestimonials={initialTestimonials} />
        </Suspense>
      </div>
    </>
  );
}
