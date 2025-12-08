
'use client'

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Wallet, User as UserIcon } from 'lucide-react';
import type { Job } from '@/lib/types';
import { getCategoryById } from '@/lib/data';
import { CategoryIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from './ui/separator';
import { UserAvatar } from './user-avatar';
import { TimeAgo } from '@/components/ui/time-ago';

interface JobCardProps {
  job: Job | null;
}

const InfoBadge = ({ icon, text, className }: { icon?: React.ElementType, text: string | number | undefined, className?: string }) => {
  if (!text) return null;
  const Icon = icon;
  return (
    <Badge variant="secondary" className={cn("inline-flex items-center gap-1.5 font-normal text-xs py-1 px-2 max-w-full", className)}>
      {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
      <span className="truncate font-medium">{text}</span>
    </Badge>
  );
};


export function JobCard({ job }: JobCardProps) {
  if (!job) {
    return (
      <Card className="p-4 space-y-3 h-full">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <div className="pt-2">
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
      </Card>
    );
  }

  const category = getCategoryById(job.categoryId || '');
  const isSeekingJob = job.postType === 'seeking_job';
  const detailUrl = isSeekingJob ? `/workers/${job.id}` : `/jobs/${job.id}`;
  
  const categoryName = category?.name || job.categoryName;
  
  const sectionColors = {
    seeking_worker: '#0D47A1',
    seeking_job: '#424242',
  };
  const sectionColor = sectionColors[job.postType];
  const categoryColor = category?.color || sectionColor;

  const defaultIcon = isSeekingJob ? 'Users' : 'Briefcase';
  const categoryIcon = category?.iconName || defaultIcon;

  const salaryText = !isSeekingJob ? (job.salary || 'عند الطلب') : undefined;

  if (isSeekingJob) {
    return (
      <Card className="flex flex-col h-full overflow-hidden rounded-xl shadow-md bg-card transition-all duration-300">
        <CardHeader className="p-4 flex-row items-center gap-4">
            <UserAvatar 
              name={job.ownerName} 
              color={job.ownerAvatarColor} 
              photoURL={job.ownerPhotoURL}
              className="h-12 w-12 text-lg flex-shrink-0"
            />
            <div className="flex-grow overflow-hidden">
              <h3 className="font-bold text-base leading-snug truncate">
                <Link href={detailUrl} className="text-foreground hover:underline">
                  {job.title}
                </Link>
              </h3>
               {categoryName && (
                  <p className="text-sm text-muted-foreground truncate">
                    {categoryName}
                  </p>
                )}
            </div>
        </CardHeader>
        <Separator/>
        <CardContent className="p-4 pt-3 flex-grow grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm overflow-hidden">
              <UserIcon className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="truncate">{job.ownerName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm overflow-hidden">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="truncate">{`${job.country}, ${job.city}`}</span>
            </div>
        </CardContent>
        <CardFooter className="p-3 pt-0 mt-auto flex items-center justify-center">
            <Button asChild size="sm" variant="secondary" className="w-full text-secondary-foreground hover:bg-secondary/80 active:scale-95 transition-transform">
                <Link href={detailUrl}>
                    عرض الملف
                </Link>
            </Button>
        </CardFooter>
      </Card>
    )
  }
  
  return (
    <Card 
        className="flex flex-col rounded-lg bg-card shadow-md h-full transition-all hover:shadow-xl w-full overflow-hidden border-t-4"
        style={{ borderColor: sectionColor }}
    >
       <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 w-full overflow-hidden">
             <div className="w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${categoryColor}1A` }}>
                <CategoryIcon name={categoryIcon} className="w-6 h-6" style={{ color: categoryColor }} />
            </div>
             <div className="w-full overflow-hidden">
                <h3 className="font-bold text-base leading-snug truncate">
                    <Link href={detailUrl} className="text-gray-900 dark:text-gray-100 hover:underline">
                        {job.title}
                    </Link>
                </h3>
                {categoryName && (
                  <p className="text-xs text-muted-foreground truncate">
                      {categoryName}
                  </p>
                )}
             </div>
          </div>
        </div>
      </CardHeader>
      
      <Separator />

      <CardContent className="p-4 flex-grow flex flex-wrap gap-2">
          <InfoBadge
              icon={MapPin}
              text={`${job.country}, ${job.city}`}
              className="bg-blue-100/60 dark:bg-blue-900/40 text-blue-800/80 dark:text-blue-200/80 border-blue-200/50 dark:border-blue-800/50"
          />
          {salaryText && (
              <InfoBadge 
                  icon={Wallet} 
                  text={salaryText} 
                  className="bg-green-100/60 dark:bg-green-900/40 text-green-800/80 dark:text-green-200/80 border-green-200/50 dark:border-green-800/50"
              />
          )}
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          <TimeAgo date={job.createdAtISO || new Date().toISOString()} initialText={job.postedAt} />
        </span>
        <Button asChild size="sm" variant="secondary" className="text-sm rounded-lg active:scale-95 transition-transform text-secondary-foreground hover:bg-secondary/80">
          <Link href={detailUrl}>{isSeekingJob ? 'عرض الملف' : 'عرض التفاصيل'}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
