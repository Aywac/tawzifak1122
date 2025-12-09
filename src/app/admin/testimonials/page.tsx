'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { Card, CardFooter } from '@/components/ui/card';
import { Loader2, MessageSquare, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { getTestimonials, deleteTestimonial } from '@/lib/data';
import type { Testimonial, FirestoreCursor } from '@/lib/types';
import { TestimonialCard } from '@/app/testimonials/testimonial-card';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 12;

export default function AdminTestimonialsPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [lastDoc, setLastDoc] = useState<FirestoreCursor>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);

  useEffect(() => {
    if (!authLoading && !userData?.isAdmin) {
      router.push('/');
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    if (userData?.isAdmin) {
      const fetchTestimonials = async () => {
        setLoading(true);
        try {
          const { data, lastDoc: cursor } = await getTestimonials({ limit: ITEMS_PER_PAGE });
          setTestimonials(data);
          setLastDoc(cursor);
          
          if (data.length < ITEMS_PER_PAGE) {
            setHasMore(false);
          }
        } catch (error) {
          toast({ variant: 'destructive', title: 'فشل تحميل الآراء' });
        } finally {
          setLoading(false);
        }
      };
      fetchTestimonials();
    }
  }, [userData, toast]);

  const loadMoreTestimonials = async () => {
    if (!lastDoc) return;
    
    setLoadingMore(true);
    try {
      const { data, lastDoc: cursor } = await getTestimonials({
        limit: ITEMS_PER_PAGE,
        lastDoc: lastDoc
      });

      setTestimonials(prev => [...prev, ...data]);
      setLastDoc(cursor);

      if (data.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'فشل تحميل المزيد من الآراء' });
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async () => {
    if (!testimonialToDelete) return;
    try {
      await deleteTestimonial(testimonialToDelete.id);
      setTestimonials(prev => prev.filter(t => t.id !== testimonialToDelete.id));
      toast({ title: "تم حذف الرأي بنجاح" });
    } catch (error) {
      toast({ variant: 'destructive', title: 'فشل حذف الرأي' });
    } finally {
      setTestimonialToDelete(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <MobilePageHeader title="إدارة الآراء">
        <MessageSquare className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={MessageSquare}
        title="إدارة آراء المستخدمين"
        description="مراجعة وحذف الآراء المنشورة على المنصة."
      />
      <div className="container mx-auto max-w-7xl px-4 pb-8 space-y-8">
        {testimonials.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="flex flex-col">
                  <div className="flex-grow">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                  <CardFooter className="p-4">
                    <Button variant="destructive" className="w-full active:scale-95 transition-transform" onClick={() => setTestimonialToDelete(testimonial)}>
                      <Trash2 className="ml-2 h-4 w-4" />
                      حذف
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className="text-center pt-4">
                <Button 
                  onClick={loadMoreTestimonials} 
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
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>لا توجد آراء لعرضها حالياً.</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!testimonialToDelete} onOpenChange={(open) => !open && setTestimonialToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا الرأي؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء سيقوم بحذف الرأي بشكل نهائي. لا يمكن التراجع عن هذا القرار.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTestimonialToDelete(null)} className="active:scale-95 transition-transform">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground active:scale-95 transition-transform">تأكيد الحذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}