"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
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
import {
  Loader2,
  Trash2,
  FileText,
  Frown,
  FileSignature,
} from "lucide-react";
import {
  getJobsByUserId,
  deleteAd,
  getJobOffers,
  getJobSeekers,
  getCompetitions,
  deleteCompetition,
  getImmigrationPosts,
  deleteImmigrationPost,
  getGlobalStats,
} from "@/lib/data";
import type { Job, Competition, ImmigrationPost, FirestoreCursor } from "@/lib/types";
import { JobCard } from "@/components/job-card";
import { CompetitionCard } from "@/components/competition-card";
import { ImmigrationCard } from "@/components/immigration-card";
import { useToast } from "@/hooks/use-toast";
import { MobilePageHeader } from "@/components/layout/mobile-page-header";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DesktopPageHeader } from "@/components/layout/desktop-page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const ITEMS_PER_PAGE = 16;

function LoadMoreButton({ onClick, loading, hasMore }: { onClick: () => void, loading: boolean, hasMore: boolean }) {
  if (!hasMore) return null;
  return (
    <div className="flex justify-center pt-6 pb-2">
      <Button onClick={onClick} disabled={loading} variant="outline" className="min-w-[150px] active:scale-95 transition-transform">
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري التحميل...</> : "تحميل المزيد"}
      </Button>
    </div>
  );
}

function AdGrid({
  ads,
  onAdDelete,
  showEditButton = false,
}: {
  ads: Job[];
  onAdDelete: (adId: string) => void;
  showEditButton?: boolean;
}) {
  if (ads.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
        <Frown className="w-16 h-16 text-muted-foreground/50" />
        <p>لا توجد إعلانات في هذا القسم.</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {ads.map((ad) => (
        <Card key={ad.id} className="flex flex-col">
          <div className="flex-grow">
            <JobCard job={ad} />
          </div>
          <CardFooter className="p-4 flex gap-2">
            {showEditButton && (
              <Button
                asChild
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Link href={`/edit-job/${ad.id}`}>
                  <FileSignature className="h-4 w-4" />
                  <span>تعديل</span>
                </Link>
              </Button>
            )}
            <Button
              variant="destructive"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              onClick={() => onAdDelete(ad.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span>حذف</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function ImmigrationGrid({
  posts,
  onAdDelete,
}: {
  posts: ImmigrationPost[];
  onAdDelete: (postId: string) => void;
}) {
  if (posts.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
        <Frown className="w-16 h-16 text-muted-foreground/50" />
        <p>لا توجد إعلانات هجرة في هذا القسم.</p>
      </div>
    );
  }
  return (
    <div dir="rtl" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="flex flex-col">
          <div className="flex-grow">
            <ImmigrationCard post={post} />
          </div>
          <CardFooter className="p-4 flex gap-2">
            <Button
              asChild
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Link href={`/edit-immigration/${post.id}`}>
                <FileSignature className="h-4 w-4" />
                <span>تعديل</span>
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              onClick={() => onAdDelete(post.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span>حذف</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function CompetitionGrid({
  competitions,
  onAdDelete,
}: {
  competitions: Competition[];
  onAdDelete: (adId: string) => void;
}) {
  if (competitions.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
        <Frown className="w-16 h-16 text-muted-foreground/50" />
        <p>لا توجد مباريات في هذا القسم.</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {competitions.map((comp) => (
        <Card key={comp.id} className="flex flex-col">
          <div className="flex-grow">
            <CompetitionCard competition={comp} />
          </div>
          <CardFooter className="p-4 flex gap-2">
            <Button
              asChild
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Link href={`/edit-competition/${comp.id}`}>
                <FileSignature className="h-4 w-4" />
                <span>تعديل</span>
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              onClick={() => onAdDelete(comp.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span>حذف</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function MyAdsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userData, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("jobs");

  const [jobOffers, setJobOffers] = useState<Job[]>([]);
  const [jobRequests, setJobRequests] = useState<Job[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [immigrationPosts, setImmigrationPosts] = useState<ImmigrationPost[]>([]);

  const [stats, setStats] = useState({
    jobs: 0,
    seekers: 0,
    competitions: 0,
    immigration: 0,
    users: 0
  });

  useEffect(() => {
    if (userData?.isAdmin) {
      getGlobalStats()
        .then(data => setStats(data))
        .catch(err => console.error("Failed to fetch stats", err));
    }
  }, [userData]);

  const [cursors, setCursors] = useState<{
    jobs: FirestoreCursor;
    seekers: FirestoreCursor;
    competitions: FirestoreCursor;
    immigration: FirestoreCursor;
  }>({ jobs: null, seekers: null, competitions: null, immigration: null });

  const [hasMore, setHasMore] = useState({
    jobs: true,
    seekers: true,
    competitions: true,
    immigration: true,
  });

  const [loadingMap, setLoadingMap] = useState({
    userAds: false,
    jobs: false,
    seekers: false,
    competitions: false,
    immigration: false,
  });

  const [adToDelete, setAdToDelete] = useState<{
    id: string;
    type: "ad" | "competition" | "immigration";
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const setLoading = (key: keyof typeof loadingMap, status: boolean) => {
    setLoadingMap(prev => ({ ...prev, [key]: status }));
  };

  useEffect(() => {
    if (user && !userData?.isAdmin && !authLoading) {
      const fetchUserAds = async () => {
        setLoading("userAds", true);
        try {
          const userJobs = await getJobsByUserId(user.uid);
          setJobRequests(userJobs);
        } catch (error) {
          toast({ variant: "destructive", title: "فشل تحميل الإعلانات" });
        } finally {
          setLoading("userAds", false);
        }
      };
      fetchUserAds();
    }
  }, [user, userData, authLoading, toast]);

  const fetchAdminData = useCallback(async (type: 'jobs' | 'seekers' | 'competitions' | 'immigration', isLoadMore = false) => {
    setLoading(type, true);
    try {
      const lastDoc = isLoadMore ? cursors[type] : null;
      let newData: any[] = [];
      let newLastDoc: FirestoreCursor = null;
      let totalFetched = 0;

      if (type === 'jobs') {
        const res = await getJobOffers({ limit: ITEMS_PER_PAGE, lastDoc });
        newData = res.data;
        newLastDoc = res.lastDoc;
        setJobOffers(prev => isLoadMore ? [...prev, ...newData] : newData);
      } else if (type === 'seekers') {
        const res = await getJobSeekers({ limit: ITEMS_PER_PAGE, lastDoc });
        newData = res.data;
        newLastDoc = res.lastDoc;
        setJobRequests(prev => isLoadMore ? [...prev, ...newData] : newData);
      } else if (type === 'competitions') {
        const res = await getCompetitions({ limit: ITEMS_PER_PAGE, lastDoc });
        newData = res.data;
        newLastDoc = res.lastDoc;
        setCompetitions(prev => isLoadMore ? [...prev, ...newData] : newData);
      } else if (type === 'immigration') {
        const res = await getImmigrationPosts({ limit: ITEMS_PER_PAGE, lastDoc });
        newData = res.data;
        newLastDoc = res.lastDoc;
        setImmigrationPosts(prev => isLoadMore ? [...prev, ...newData] : newData);
      }

      totalFetched = newData.length;
      
      setCursors(prev => ({ ...prev, [type]: newLastDoc }));
      setHasMore(prev => ({ ...prev, [type]: totalFetched === ITEMS_PER_PAGE }));

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "فشل تحميل البيانات" });
    } finally {
      setLoading(type, false);
    }
  }, [cursors, toast]);

  useEffect(() => {
    if (!userData?.isAdmin) return;

    if (activeTab === 'jobs' && jobOffers.length === 0) fetchAdminData('jobs');
    if (activeTab === 'seekers' && jobRequests.length === 0) fetchAdminData('seekers');
    if (activeTab === 'competitions' && competitions.length === 0) fetchAdminData('competitions');
    if (activeTab === 'migration' && immigrationPosts.length === 0) fetchAdminData('immigration');

  }, [activeTab, userData, jobOffers.length, jobRequests.length, competitions.length, immigrationPosts.length, fetchAdminData]);


  const handleDelete = async () => {
    if (!adToDelete) return;
    try {
      if (adToDelete.type === "ad") {
        await deleteAd(adToDelete.id);
        setJobOffers((prev) => prev.filter((ad) => ad.id !== adToDelete.id));
        setJobRequests((prev) => prev.filter((ad) => ad.id !== adToDelete.id));
      } else if (adToDelete.type === "competition") {
        await deleteCompetition(adToDelete.id);
        setCompetitions((prevComps) => prevComps.filter((comp) => comp.id !== adToDelete.id));
      } else if (adToDelete.type === "immigration") {
        await deleteImmigrationPost(adToDelete.id);
        setImmigrationPosts((prevPosts) => prevPosts.filter((post) => post.id !== adToDelete.id));
      }
      toast({ title: "تم حذف الإعلان بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل حذف الإعلان" });
    } finally {
      setAdToDelete(null);
    }
  };

  const handleDeleteTrigger = (id: string, type: "ad" | "competition" | "immigration") => {
    setAdToDelete({ id, type });
  };

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <MobilePageHeader title="إعلاناتي">
        <FileText className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={FileText}
        title={userData?.isAdmin ? "لوحة تحكم الإعلانات" : "إعلاناتي"}
        description={
          userData?.isAdmin
            ? "إدارة جميع الإعلانات والمباريات المنشورة في المنصة."
            : "هنا يمكنك إدارة جميع إعلاناتك، تعديلها، أو حذفها."
        }
      />
      <div className="flex-grow container mx-auto max-w-7xl px-4 pb-8">
        
        {userData?.isAdmin ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 h-auto">
              <TabsTrigger value="jobs" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-sm">
                وظائف ({stats.jobs})
              </TabsTrigger>
              <TabsTrigger value="seekers" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-sm">
                باحثون ({stats.seekers})
              </TabsTrigger>
              <TabsTrigger value="migration" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-sm">
                هجرة ({stats.immigration})
              </TabsTrigger>
              <TabsTrigger value="competitions" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-sm">
                مباريات ({stats.competitions})
              </TabsTrigger>
            </TabsList>

            <Card>
              <CardContent className="pt-6">
                
                <TabsContent value="jobs" className="mt-0 space-y-4">
                  {loadingMap.jobs && jobOffers.length === 0 ? (
                     <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                  ) : (
                    <>
                      <AdGrid ads={jobOffers} onAdDelete={(id) => handleDeleteTrigger(id, "ad")} showEditButton={true} />
                      <LoadMoreButton onClick={() => fetchAdminData('jobs', true)} loading={loadingMap.jobs} hasMore={hasMore.jobs} />
                    </>
                  )}
                </TabsContent>

                <TabsContent value="seekers" className="mt-0 space-y-4">
                  {loadingMap.seekers && jobRequests.length === 0 ? (
                     <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                  ) : (
                    <>
                      <AdGrid ads={jobRequests} onAdDelete={(id) => handleDeleteTrigger(id, "ad")} showEditButton={false} />
                      <LoadMoreButton onClick={() => fetchAdminData('seekers', true)} loading={loadingMap.seekers} hasMore={hasMore.seekers} />
                    </>
                  )}
                </TabsContent>

                <TabsContent value="migration" className="mt-0 space-y-4">
                  {loadingMap.immigration && immigrationPosts.length === 0 ? (
                     <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                  ) : (
                    <>
                      <ImmigrationGrid posts={immigrationPosts} onAdDelete={(id) => handleDeleteTrigger(id, "immigration")} />
                      <LoadMoreButton onClick={() => fetchAdminData('immigration', true)} loading={loadingMap.immigration} hasMore={hasMore.immigration} />
                    </>
                  )}
                </TabsContent>

                <TabsContent value="competitions" className="mt-0 space-y-4">
                  {loadingMap.competitions && competitions.length === 0 ? (
                     <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                  ) : (
                    <>
                      <CompetitionGrid competitions={competitions} onAdDelete={(id) => handleDeleteTrigger(id, "competition")} />
                      <LoadMoreButton onClick={() => fetchAdminData('competitions', true)} loading={loadingMap.competitions} hasMore={hasMore.competitions} />
                    </>
                  )}
                </TabsContent>

              </CardContent>
            </Card>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="pt-6">
              {loadingMap.userAds ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <AdGrid ads={jobRequests} onAdDelete={(id) => handleDeleteTrigger(id, "ad")} showEditButton={true} />
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={!!adToDelete} onOpenChange={(open) => !open && setAdToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء سيقوم بحذف الإعلان بشكل نهائي. لا يمكن التراجع عن هذا القرار.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdToDelete(null)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground active:scale-95 transition-transform">
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}