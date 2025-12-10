'use client';

import { getArticles } from '@/lib/data';
import { ArticleCard } from './article-card';
import type { Article, FirestoreCursor } from '@/lib/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

const ARTICLES_PER_PAGE = 8;

export function PageContent({ initialArticles = [] }: { initialArticles?: Article[] }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [lastDoc, setLastDoc] = useState<FirestoreCursor>(null);
  
  const [loading, setLoading] = useState(initialArticles.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialArticles.length >= ARTICLES_PER_PAGE);

  const fetchArticles = async (cursor: FirestoreCursor) => {
    setLoadingMore(true);
    try {
      const { data: newArticles, lastDoc: nextCursor } = await getArticles({
        limit: ARTICLES_PER_PAGE,
        lastDoc: cursor
      });

      setArticles(prev => [...prev, ...newArticles]);
      setLastDoc(nextCursor);

      if (newArticles.length < ARTICLES_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more articles", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreArticles = () => {
    let cursorToUse = lastDoc;

    if (!cursorToUse && articles.length > 0) {
      const lastArticle = articles[articles.length - 1];
      
      if (lastArticle.createdAtISO) {
         cursorToUse = Timestamp.fromDate(new Date(lastArticle.createdAtISO));
      } else if (lastArticle.createdAt && typeof lastArticle.createdAt.toDate === 'function') {
         cursorToUse = lastArticle.createdAt;
      }
    }

    fetchArticles(cursorToUse);
  };

  if (loading && articles.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
              <div className="h-[200px] w-full rounded-xl bg-muted animate-pulse" />
              <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
              </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          لا توجد مقالات منشورة حالياً.
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-12">
          <Button 
            onClick={loadMoreArticles} 
            disabled={loadingMore}
            size="lg" 
            variant="outline"
            className="active:scale-95 transition-transform min-w-[150px]"
          >
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
  );
}