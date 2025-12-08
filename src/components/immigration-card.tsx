
'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Wallet, Users } from 'lucide-react';
import type { ImmigrationPost } from '@/lib/types';
import { cn, getProgramTypeDetails } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryIcon } from './icons';
import { Separator } from './ui/separator';
import { TimeAgo } from '@/components/ui/time-ago';

interface ImmigrationCardProps {
  post: ImmigrationPost | null;
}

const InfoBadge = ({ icon, text, className }: { icon?: React.ElementType; text: string | undefined; className?: string }) => {
  if (!text) return null;
  const Icon = icon;
  return (
    <Badge
      variant="secondary"
      className={cn("inline-flex items-center gap-1.5 font-normal text-xs py-1 px-2 max-w-full", className)}
    >
      {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
      <span className="truncate font-medium">{text}</span>
    </Badge>
  );
};


export function ImmigrationCard({ post }: ImmigrationCardProps) {
  if (!post) {
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

  const detailUrl = `/immigration/${post.id}`;
  const sectionColor = '#0ea5e9'; // Main section color (sky-500)
  
  const programDetails = getProgramTypeDetails(post.programType);
  const iconName = programDetails.icon;
  const iconColor = programDetails.color;


  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-xl shadow-md bg-card hover:shadow-2xl transition-all duration-300 border-2" style={{ borderColor: sectionColor }}>
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${iconColor}1A` }}>
             <CategoryIcon name={iconName} className="h-6 w-6" style={{ color: iconColor }} />
          </div>
          <div className="flex-grow overflow-hidden">
            <h3 className="font-bold text-base leading-snug truncate text-gray-900 dark:text-gray-100">
              <Link href={detailUrl} className="hover:underline">
                {post.title}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">{programDetails.label}</p>
          </div>
        </div>
      </CardHeader>
      
      <Separator />

      <CardContent className="p-4 pt-3 flex-grow flex flex-wrap gap-2">
        <InfoBadge icon={MapPin} text={`${post.targetCountry}${post.city ? ', ' + post.city : ''}`} className="bg-sky-100/60 dark:bg-sky-900/40 text-sky-700/80 dark:text-sky-300/80 border-sky-200/50 dark:border-sky-800/50"/>
        {post.positionsAvailable && <InfoBadge icon={Users} text={`${post.positionsAvailable} منصب`} className="bg-orange-100/60 dark:bg-orange-900/40 text-orange-800/80 dark:text-orange-200/80 border-orange-200/50 dark:border-orange-800/50" />}
        {post.salary && <InfoBadge icon={Wallet} text={post.salary} className="bg-green-100/60 dark:bg-green-900/40 text-green-800/80 dark:text-green-200/80 border-green-200/50 dark:border-green-800/50" />}
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto bg-card flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          <TimeAgo date={post.createdAtISO || new Date().toISOString()} initialText={post.postedAt} />
        </span>
         <Button asChild size="sm" variant="secondary" className="text-sm rounded-lg active:scale-95 transition-transform text-secondary-foreground hover:bg-secondary/80">
          <Link href={detailUrl}>
            عرض التفاصيل
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
