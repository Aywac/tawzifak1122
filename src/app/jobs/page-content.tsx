'use client';

import { Suspense, useEffect, useState } from 'react';
import { JobCard } from '@/components/job-card';
import { JobFilters } from '@/components/job-filters';
import type { FirestoreCursor, Job, WorkType } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { getJobOffers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

const ITEMS_PER_PAGE = 16;

function JobFiltersSkeleton() {
  return <div className="h-14 bg-muted rounded-lg w-full animate-pulse" />;
}

export function PageContent({ initialJobs = [] }: { initialJobs?: Job[] }) {
  const searchParams = useSearchParams();
  
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [lastDoc, setLastDoc] = useState<FirestoreCursor>(null);
  
  const [loading, setLoading] = useState(initialJobs.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const q = searchParams.get('q');
  const country = searchParams.get('country');
  const city = searchParams.get('city');
  const category = searchParams.get('category');
  const workType = searchParams.get('job');

  useEffect(() => {
    const isInitialState = !q && !country && !city && !category && !workType && initialJobs.length > 0;
    
    if (isInitialState) {
      setJobs(initialJobs);
      setLastDoc(null);
      setLoading(false);
      setHasMore(initialJobs.length >= ITEMS_PER_PAGE);
      return;
    }

    setJobs([]);
    setLastDoc(null);
    setHasMore(true);
    setLoading(true);
    fetchAndSetJobs(null, true);
  }, [q, country, city, category, workType, initialJobs]);

  const fetchAndSetJobs = async (cursor: FirestoreCursor, isReset: boolean) => {
    try {
      const { data: newJobs, lastDoc: nextCursor } = await getJobOffers({
        searchQuery: q || undefined,
        country: country || undefined,
        city: city || undefined,
        categoryId: category || undefined,
        workType: (workType as WorkType) || undefined,
        limit: ITEMS_PER_PAGE,
        lastDoc: cursor,
      });

      if (isReset) {
        setJobs(newJobs);
      } else {
        setJobs(prev => [...prev, ...newJobs]);
      }

      setLastDoc(nextCursor);

      if (newJobs.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    setLoadingMore(true);

    let cursorToUse = lastDoc;

    if (!cursorToUse && jobs.length > 0) {
      const lastJob = jobs[jobs.length - 1];
      if (lastJob.createdAtISO) {
        cursorToUse = Timestamp.fromDate(new Date(lastJob.createdAtISO));
      }
    }

    fetchAndSetJobs(cursorToUse, false);
  };

  return (
    <>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm md:top-20">
        <div className="container py-3">
          <Suspense fallback={<JobFiltersSkeleton />}>
            <JobFilters />
          </Suspense>
        </div>
      </div>

      <div className="container pt-4 pb-6">
        {loading && jobs.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  size="lg"
                  variant="outline"
                  className="active:scale-95 transition-transform"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : 'تحميل المزيد'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-10">
            لا توجد عروض عمل تطابق بحثك.
          </p>
        )}
      </div>
    </>
  );
}