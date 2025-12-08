
import type { Testimonial } from '@/lib/types';
import { CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/user-avatar';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimeAgo } from '@/components/ui/time-ago';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <CardContent className="relative p-6 h-full flex flex-col bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-2xl transition-all duration-300 border-border/50 hover:border-primary/50 rounded-lg">
      <div className="flex items-center gap-4 mb-4">
        <UserAvatar name={testimonial.userName} color={testimonial.userAvatarColor} className="h-12 w-12 text-xl shadow-inner" />
        <div>
          <h4 className="font-bold text-lg text-foreground">{testimonial.userName}</h4>
          <p className="text-xs text-muted-foreground">
            <TimeAgo date={testimonial.createdAtISO || new Date().toISOString()} initialText={testimonial.postedAt} />
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-yellow-500 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={cn(
              "h-4 w-4", 
              testimonial.rating > i ? "fill-yellow-400" : "fill-muted stroke-muted-foreground"
            )}
          />
        ))}
      </div>
      <blockquote className="text-muted-foreground text-base leading-relaxed mt-2 flex-grow border-r-2 border-primary pr-4">
        {testimonial.content}
      </blockquote>
    </CardContent>
  );
}
