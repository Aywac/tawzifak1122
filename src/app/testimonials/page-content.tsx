'use client';

import { TestimonialCard } from './testimonial-card';
import type { Testimonial, FirestoreCursor } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getTestimonials } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

const ITEMS_PER_PAGE = 12;

export function PageContent({ initialTestimonials = [] }: { initialTestimonials?: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [lastDoc, setLastDoc] = useState<FirestoreCursor>(null);
  
  const [loading, setLoading] = useState(initialTestimonials.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialTestimonials.length >= ITEMS_PER_PAGE);

  const fetchTestimonials = async (cursor: FirestoreCursor) => {
    setLoadingMore(true);

    try {
      const { data: newReviews, lastDoc: nextCursor } = await getTestimonials({
          limit: ITEMS_PER_PAGE,
          lastDoc: cursor
      });

      setTestimonials(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const uniqueNewReviews = newReviews.filter(t => !existingIds.has(t.id));
        return [...prev, ...uniqueNewReviews];
      });

      setLastDoc(nextCursor);

      if (newReviews.length < ITEMS_PER_PAGE) {
          setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load testimonials", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    let cursorToUse = lastDoc;

    if (!cursorToUse && testimonials.length > 0) {
      const lastItem = testimonials[testimonials.length - 1];
      if (lastItem.createdAtISO) {
         cursorToUse = Timestamp.fromDate(new Date(lastItem.createdAtISO));
      }
    }

    fetchTestimonials(cursorToUse);
  };

  if (loading && testimonials.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
            <div className="h-24 w-full bg-muted rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-12">
          <Button onClick={loadMore} disabled={loadingMore} size="lg" variant="outline" className="active:scale-95 transition-transform">
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
  );
}