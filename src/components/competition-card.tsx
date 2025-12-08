
'use client'

import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import type { Competition } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrganizerByName } from '@/lib/data';
import { CategoryIcon } from './icons';
import { Separator } from './ui/separator';
import { TimeAgo } from '@/components/ui/time-ago';

interface CompetitionCardProps {
  competition: Competition | null;
}

const InfoBadge = ({ icon, text, variant, className, textColor }: { icon?: React.ElementType, text: string | number | undefined, variant: "secondary" | "destructive" | "accent" | "default", className?: string, textColor?: string }) => {
  if (!text) return null;
  const Icon = icon;
  return (
    <Badge variant={variant} className={cn("inline-flex items-center gap-1.5 font-normal text-xs py-1 px-2 max-w-full", className)}>
      {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
      <span className={cn("truncate font-medium", textColor)}>{text}</span>
    </Badge>
  );
};


export function CompetitionCard({ competition }: CompetitionCardProps) {
  if (!competition) {
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

  const detailUrl = `/competitions/${competition.id}`;
  const organizer = getOrganizerByName(competition.organizer);
  const sectionColor = '#14532d';
  const organizerIcon = organizer?.icon || 'Landmark';
  const organizerColor = organizer?.color || sectionColor;
  
  return (
    <Card 
        className="flex flex-col rounded-lg bg-card shadow-md h-full transition-all hover:shadow-xl w-full overflow-hidden border-2 border-dashed"
        style={{ borderColor: sectionColor }}
    >
       <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 w-full overflow-hidden">
             <div className="w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${organizerColor}1A`}}>
                <CategoryIcon name={organizerIcon} className="w-6 h-6" style={{ color: organizerColor }} />
             </div>
             <div className="w-full overflow-hidden">
                <h3 className="font-bold text-base leading-snug truncate">
                    <Link href={detailUrl} className="text-gray-900 dark:text-gray-100 hover:underline">
                        {competition.title}
                    </Link>
                </h3>
                 <p className="text-xs text-muted-foreground truncate">
                    {competition.organizer}
                </p>
             </div>
          </div>
        </div>
      </CardHeader>
      
      <Separator />

      <CardContent className="p-4 flex-grow flex flex-wrap gap-2">
        {competition.location && (
            <InfoBadge
                icon={MapPin}
                text={competition.location}
                variant="secondary"
                className="bg-green-100/60 dark:bg-green-900/40 text-green-800/80 dark:text-green-200/80 border-green-200/50 dark:border-green-800/50"
            />
        )}
        <InfoBadge
            icon={Calendar}
            text={`آخر أجل: ${competition.deadline}`}
            variant="secondary"
            className="bg-red-100/60 dark:bg-red-900/40 text-red-800/80 dark:text-red-200/80 border-red-200/50 dark:border-red-800/50"
        />
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          <TimeAgo date={competition.createdAtISO || new Date().toISOString()} initialText={competition.postedAt} />
        </span>
        <Button asChild size="sm" variant="secondary" className="text-sm rounded-lg active:scale-95 transition-transform text-secondary-foreground hover:bg-secondary/80">
          <Link href={detailUrl}>عرض التفاصيل</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
