'use client';

import { TestimonialCard } from './testimonial-card';
import type { Testimonial, FirestoreCursor } from '@/lib/types';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { getTestimonials } from '@/lib/data';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export function PageContent() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [lastDoc, setLastDoc] = useState<FirestoreCursor>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const isInitialized = useRef(false);

  const fetchTestimonials = async (cursor: FirestoreCursor) => {
    if (cursor) setLoadingMore(true);
    
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

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      fetchTestimonials(null);
    }
  }, []);

  const loadMore = () => {
    if (!lastDoc) return;
    fetchTestimonials(lastDoc);
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