'use client';

import { useEffect, useState } from 'react';
import { ImmigrationCard } from '@/components/immigration-card';
import { ImmigrationFilters } from '@/components/immigration-filters';
import type { ImmigrationPost, FirestoreCursor } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { getImmigrationPosts } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 16;

export function PageContent() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<ImmigrationPost[]>([]);
  
  const [lastDoc, setLastDoc] = useState<FirestoreCursor>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const q = searchParams.get('q');

  useEffect(() => {
    setPosts([]);
    setLastDoc(null);
    setHasMore(true);
    setLoading(true);
    fetchPosts(null, true);
  }, [q]);

  const fetchPosts = async (cursor: FirestoreCursor, isReset: boolean) => {
    try {
      const { data: newPosts, lastDoc: nextCursor } = await getImmigrationPosts({
        searchQuery: q || undefined,
        limit: ITEMS_PER_PAGE,
        lastDoc: cursor
      });

      if (isReset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setLastDoc(nextCursor);
      setHasMore(newPosts.length === ITEMS_PER_PAGE);

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
    fetchPosts(lastDoc, false);
  };

  return (
    <>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm md:top-20">
        <div className="container py-3">
          <ImmigrationFilters />
        </div>
      </div>

      <div className="container pt-4 pb-6">
        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {posts.map((post) => <ImmigrationCard key={post.id} post={post} />)}
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
          <p className="col-span-full text-center text-muted-foreground py-10">لا توجد فرص هجرة تطابق بحثك.</p>
        )}
      </div>
    </>
  );
}