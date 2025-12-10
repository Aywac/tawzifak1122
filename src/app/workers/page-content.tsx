'use client';

import { JobCard } from '@/components/job-card';
import { Suspense, useEffect, useState } from 'react';
import { JobFilters } from '@/components/job-filters';
import type { WorkType, Job, FirestoreCursor } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { getJobSeekers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

const ITEMS_PER_PAGE = 16;

function JobFiltersSkeleton() {
  return <div className="h-14 bg-muted rounded-lg w-full animate-pulse" />;
}

export function PageContent({ initialWorkers = [] }: { initialWorkers?: Job[] }) {
  const searchParams = useSearchParams();
  
  const [workers, setWorkers] = useState<Job[]>(initialWorkers);
  const [lastDoc, setLastDoc] = useState<FirestoreCursor>(null);
  
  const [loading, setLoading] = useState(initialWorkers.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const q = searchParams.get('q');
  const country = searchParams.get('country');
  const city = searchParams.get('city');
  const category = searchParams.get('category');
  const workType = searchParams.get('job');

  useEffect(() => {
    const isInitialState = !q && !country && !city && !category && !workType && initialWorkers.length > 0;

    if (isInitialState) {
        setWorkers(initialWorkers);
        setLastDoc(null);
        setLoading(false);
        setHasMore(initialWorkers.length >= ITEMS_PER_PAGE);
        return;
    }

    setWorkers([]);
    setLastDoc(null);
    setHasMore(true);
    setLoading(true);
    fetchWorkers(null, true);
  }, [q, country, city, category, workType, initialWorkers]);

  const fetchWorkers = async (cursor: FirestoreCursor, isReset: boolean) => {
    try {
      const { data: newWorkers, lastDoc: nextCursor } = await getJobSeekers({
        searchQuery: q || undefined,
        country: country || undefined,
        city: city || undefined,
        categoryId: category || undefined,
        workType: workType as WorkType || undefined,
        limit: ITEMS_PER_PAGE,
        lastDoc: cursor
      });

      if (isReset) {
        setWorkers(newWorkers);
      } else {
        setWorkers(prev => [...prev, ...newWorkers]);
      }

      setLastDoc(nextCursor);
      
      if (newWorkers.length < ITEMS_PER_PAGE) {
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

    if (!cursorToUse && workers.length > 0) {
      const lastWorker = workers[workers.length - 1];
      if (lastWorker.createdAtISO) {
         cursorToUse = Timestamp.fromDate(new Date(lastWorker.createdAtISO));
      }
    }

    fetchWorkers(cursorToUse, false);
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
        {loading && workers.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : workers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {workers.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <Button onClick={loadMore} disabled={loadingMore} size="lg" variant="outline" className="active:scale-95 transition-transform">
                  {loadingMore ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    'تحميل المزيد'
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-10">لا يوجد باحثون عن عمل يطابقون بحثك.</p>
        )}
      </div>
    </>
  );
}