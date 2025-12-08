
import type { Metadata } from 'next';
import Link from 'next/link';
import { JobCard } from '@/components/job-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCachedHomePageJobs, getCachedHomePageSeekers, getCachedHomePageCompetitions, getCachedHomePageImmigration, getCachedGlobalStats, getCachedHomePageTestimonials } from '@/lib/data';
import React, { Suspense } from 'react';
import { Newspaper, Briefcase, Users, ArrowLeft, Landmark, Plane } from 'lucide-react';
import { HomePageFilters } from './home-page-filters';
import { HomeCarousel } from './home-carousel';
import { HomeExtraSections } from './home-extra-sections';
import { Separator } from '@/components/ui/separator';
import { HomeHeaderMobile } from './home-header-mobile';
import { CompetitionCard } from '@/components/competition-card';
import { ImmigrationCard } from '@/components/immigration-card';
import { cn } from '@/lib/utils';
import type { Job, Competition, ImmigrationPost, Testimonial } from '@/lib/types';
import { headers } from 'next/headers';

export const revalidate = 3600; // Revalidate every hour

const appName = 'توظيفك';
const appDescription = "تعرّف أفضل عروض العمل وفرص الهجرة القانونية والمباريات العمومية بسهولة وموثوقية. اعثر على الفرص التي تناسب مهاراتك وطموحاتك المهنية بسرعة وفعالية وابدأ رحلتك نحو مستقبل مهني ناجح.";

export const metadata: Metadata = {
  title: {
    default: "توظيفك – اكتشف أحدث الوظائف وفرص الهجرة والمباريات العمومية",
    template: `%s | ${appName}`
  },
  description: appDescription,
  robots: 'index, follow',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

function JobFiltersSkeleton() {
  return (
    <div className="flex gap-2 items-center">
      <div className="h-16 bg-muted rounded-2xl w-full animate-pulse flex-grow" />
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <JobCard key={i} job={null} />
      ))}
    </div>
  );
}

interface SectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  iconColor?: string;
  children: React.ReactNode;
}

function Section({ icon: Icon, title, description, href, iconColor, children }: SectionProps) {
  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-8 w-8" style={{ color: iconColor || 'hsl(var(--primary))' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button asChild variant="outline" className="shrink-0 active:scale-95 transition-transform">
          <Link href={href}>
            عرض الكل
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      {children}
    </section>
  );
}

function ArticlesSection() {
  const articleSectionColor = '#00897B';
  const articlePrimaryLight = `${articleSectionColor}1A`;

  return (
    <section>
      <Card
        className="overflow-hidden border"
        style={{
          '--article-primary': articleSectionColor,
          '--article-primary-light': articlePrimaryLight,
          borderColor: `${articleSectionColor}33`,
          background: `linear-gradient(to bottom right, var(--article-primary-light), hsl(var(--background)))`,
        } as React.CSSProperties}
      >
        <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between text-center md:text-right gap-4 md:gap-8">
          <div className="flex-shrink-0">
            <div className="p-4 rounded-full w-fit mx-auto md:mx-0" style={{ backgroundColor: 'var(--article-primary-light)' }}>
              <Newspaper className="h-10 w-10 md:h-12 md:w-12" style={{ color: 'var(--article-primary)' }} />
            </div>
          </div>
          <div className="flex-grow">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">مقالات لنموك المهني</h2>
            <p className="text-muted-foreground mt-2 mb-6 max-w-2xl mx-auto md:mx-0">
              نصائح للتوظيف، كتابة السيرة الذاتية، وفرص الربح من الإنترنت. محتوى موجه للعرب الباحثين عن الاستقرار المهني أو الحرية المالية.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button asChild size="lg" style={{ backgroundColor: 'var(--article-primary)' }} className="w-full md:w-auto active:scale-95 transition-transform">
              <Link href="/articles">
                اكتشف المقالات
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

interface HomePageData {
  jobOffers: Job[];
  jobSeekers: Job[];
  competitions: Competition[];
  immigrationPosts: ImmigrationPost[];
  testimonials: Testimonial[];
  stats: {
    jobs: number;
    competitions: number;
    immigration: number;
    seekers: number;
  };
}

async function getHomePageData(isMobile: boolean): Promise<HomePageData> {
  const [
    jobOffersData,
    jobSeekersData,
    competitionsData,
    immigrationPostsData,
    testimonialsData,
    statsData,
  ] = await Promise.all([
    getCachedHomePageJobs(isMobile),
    getCachedHomePageSeekers(isMobile),
    getCachedHomePageCompetitions(isMobile),
    getCachedHomePageImmigration(isMobile),
    getCachedHomePageTestimonials(isMobile),
    getCachedGlobalStats(),
  ]);

  return {
    jobOffers: jobOffersData.data,
    jobSeekers: jobSeekersData.data,
    competitions: competitionsData.data,
    immigrationPosts: immigrationPostsData.data,
    testimonials: testimonialsData.data,
    stats: statsData,
  };
}

export default async function HomePage() {
  const userAgent = headers().get('user-agent') || '';
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const data = await getHomePageData(isMobile);

  return (
    <>
      <HomeHeaderMobile />

      <div className="container mt-4">  
        <Suspense fallback={<JobFiltersSkeleton />}>  
          <HomePageFilters />  
        </Suspense>  
      </div>  
      
      <div className="container mt-6 md:mt-8 mb-12">  
        <div className="space-y-12">  
          <HomeCarousel />  
            
          <Suspense fallback={<SectionSkeleton />}>  
            <Section   
              icon={Briefcase}  
              title="عروض العمل"  
              description="اكتشف آخر فرص الشغل التي أضافها أصحاب العمل في مختلف المجالات."  
              href="/jobs"  
              iconColor="#0D47A1"  
            >  
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">  
                {data.jobOffers.map((job) => (  
                  <div key={job.id}>  
                    <JobCard job={job} />  
                  </div>  
                ))}  
              </div>  
            </Section>  
          </Suspense>  
            
          {data.immigrationPosts.length > 0 && (  
            <>  
              <Separator />  
              <Suspense fallback={<SectionSkeleton />}>  
                <Section   
                  icon={Plane}  
                  title="فرص الهجرة"  
                  description="اكتشف أحدث فرص الهجرة للعمل، الدراسة، أو التدريب حول العالم."  
                  href="/immigration"  
                  iconColor="#0ea5e9"  
                >  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">  
                    {data.immigrationPosts.map((post) => (  
                      <div key={post.id}>  
                        <ImmigrationCard post={post} />  
                      </div>  
                    ))}  
                  </div>  
                </Section>  
              </Suspense>  
            </>  
          )}  

          {data.competitions.length > 0 && (  
            <>  
              <Separator />  
              <Suspense fallback={<SectionSkeleton />}>  
                <Section   
                  icon={Landmark}  
                  title="المباريات العمومية"  
                  description="تصفح آخر مباريات التوظيف في القطاع العام."  
                  href="/competitions"  
                  iconColor="#14532d"  
                >  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">  
                    {data.competitions.map((comp, index) => (  
                      <div key={comp.id} className={cn(index >= 2 && 'hidden sm:block', index >= 4 && 'lg:hidden')}>  
                        <CompetitionCard competition={comp} />  
                      </div>  
                    ))}  
                  </div>  
                </Section>  
              </Suspense>  
            </>  
          )}  
            
          <Separator />  
          <Suspense fallback={<SectionSkeleton />}>  
            <Section  
              icon={Users}  
              title="باحثون عن عمل"  
              description="تصفح ملفات المرشحين والمهنيين المستعدين للانضمام إلى فريقك."  
              href="/workers"  
              iconColor="#424242"  
            >  
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">  
                {data.jobSeekers.map((job, index) => (  
                  <div key={job.id} className={cn(index >= 2 && 'hidden sm:block', index >= 4 && 'lg:hidden')}>  
                    <JobCard job={job} />  
                  </div>  
                ))}  
              </div>  
            </Section>  
          </Suspense>  
            
          <Separator />  
          <ArticlesSection />  
            
          <Suspense>  
            <HomeExtraSections  
              testimonials={data.testimonials}  
              stats={data.stats}  
            />  
          </Suspense>  
        </div>  
      </div>  
    </>
  );
      }
