'use client';

import { Suspense, useEffect, useState } from 'react';
import { CompetitionCard } from '@/components/competition-card';
import { CompetitionFilters } from '@/components/competition-filters';
import type { Competition, FirestoreCursor } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { getCompetitions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 16;

function CompetitionFiltersSkeleton() {
  return <div className="h-14 bg-muted rounded-xl w-full animate-pulse" />;
}

export function PageContent() {
  const searchParams = useSearchParams();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  
  const [lastDoc, setLastDoc] = useState<FirestoreCursor>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const q = searchParams.get('q');

  useEffect(() => {
    setCompetitions([]);
    setLastDoc(null);
    setHasMore(true);
    setLoading(true);
    fetchCompetitions(null, true);
  }, [q]);

  const fetchCompetitions = async (cursor: FirestoreCursor, isReset: boolean) => {
    try {
      const { data: newComps, lastDoc: nextCursor } = await getCompetitions({
        searchQuery: q || undefined,
        limit: ITEMS_PER_PAGE,
        lastDoc: cursor
      });

      if (isReset) {
        setCompetitions(newComps);
      } else {
        setCompetitions(prev => [...prev, ...newComps]);
      }

      setLastDoc(nextCursor);
      setHasMore(newComps.length === ITEMS_PER_PAGE);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!lastDoc) return;
    setLoadingMore(true);
    fetchCompetitions(lastDoc, false);
  };

  return (
    <>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm md:top-20">
        <div className="container py-3">
          <Suspense fallback={<CompetitionFiltersSkeleton />}>
            <CompetitionFilters />
          </Suspense>
        </div>
      </div>

      <div className="container pt-4 pb-6">
        {loading && competitions.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : competitions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {competitions.map((comp) => <CompetitionCard key={comp.id} competition={comp} />)}
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
          <p className="col-span-full text-center text-muted-foreground py-10">لا توجد مباريات تطابق بحثك.</p>
        )}
      </div>
    </>
  );
}