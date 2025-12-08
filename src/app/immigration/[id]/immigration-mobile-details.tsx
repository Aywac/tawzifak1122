
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CalendarDays, Target, Link as LinkIcon, ClipboardList, Info, MapPin,
  GraduationCap, Briefcase, Users, Award, Wallet, HelpCircle, Mail, MessageSquare,
  Instagram, Phone, Bookmark, CheckSquare, LayoutGrid
} from 'lucide-react';
import type { ImmigrationPost } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { ReportAdDialog } from '@/app/jobs/[id]/report-ad-dialog';
import { SaveAdButton } from '@/app/jobs/[id]/save-ad-button';
import { ImmigrationCard } from '@/components/immigration-card';
import { CategoryIcon } from '@/components/icons';
import { getProgramTypeDetails, cn } from '@/lib/utils';
import { ShareButton } from '@/app/jobs/[id]/share-button';
import { TimeAgo } from '@/components/ui/time-ago';

const InfoItem = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number | undefined; color?: string }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg text-center h-full">
            <Icon className="h-6 w-6 mx-auto mb-1" style={{ color }} />
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-semibold text-sm">{String(value)}</dd>
        </div>
    );
};

const DetailSection = ({ icon: Icon, title, color, children }: { icon: React.ElementType, title: string, color?: string, children: React.ReactNode }) => {
    if (!children) return null;
    return (
        <div>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-3" style={{color}}>
                <Icon className="h-5 w-5" />
                {title}
            </h3>
            {children}
        </div>
    );
};

const FormattedText = ({ text }: { text?: string }) => {
  if (!text || text.trim() === '') return <p className="italic text-muted-foreground">غير محدد</p>;

  const contentBlocks = text.split('\n').filter(line => line.trim() !== '');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} className="list-disc list-outside ms-6 my-4 space-y-2">
          {listItems.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  contentBlocks.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.replace(/^[-*]\s*/, ''));
    } else {
      flushList(`ul-${i}`);
      elements.push(<p key={`p-${i}`} className="mb-4 last:mb-0">{trimmed}</p>);
    }
  });

  flushList('ul-end'); 

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none text-foreground">
      {elements}
    </div>
  );
};


interface ImmigrationMobileDetailsProps {
    post: ImmigrationPost;
    similarPosts: ImmigrationPost[];
}

export function ImmigrationMobileDetails({ post, similarPosts }: ImmigrationMobileDetailsProps) {
    const programDetails = getProgramTypeDetails(post.programType);
    const sectionColor = '#0ea5e9';
    const iconName = programDetails.icon;
    const iconColor = programDetails.color;
    
    const contactButtons = [
        post.phone && { type: 'phone', href: `tel:${post.phone}`, label: 'اتصال', icon: Phone, className: 'bg-[#0D47A1] hover:bg-[#0D47A1]/90' },
        post.whatsapp && { type: 'whatsapp', href: `https://wa.me/${post.whatsapp.replace(/\+/g, '')}`, label: 'واتساب', icon: MessageSquare, className: 'bg-green-600 hover:bg-green-700' },
        post.email && { type: 'email', href: `mailto:${post.email}`, label: 'البريد الإلكتروني', icon: Mail, className: 'bg-gray-600 hover:bg-gray-700' },
        post.instagram && { type: 'instagram', href: `https://instagram.com/${post.instagram.replace(/@/g, '')}`, label: 'إنستغرام', icon: Instagram, className: 'bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90' },
    ].filter(Boolean);

    const descriptionSection = post.description ? { id: 'description', icon: Info, title: "وصف تفصيلي", content: <FormattedText text={post.description} /> } : null;

    const allOtherSections = [
        post.availablePositions && { id: 'availablePositions', icon: Briefcase, title: "الوظائف المتاحة", content: <FormattedText text={post.availablePositions} /> },
        post.requirements && { id: 'requirements', icon: ClipboardList, title: "الشروط العامة", content: <FormattedText text={post.requirements} /> },
        post.qualifications && { id: 'qualifications', icon: GraduationCap, title: "المؤهلات المطلوبة", content: <FormattedText text={post.qualifications} /> },
        post.experience && { id: 'experience', icon: Award, title: "الخبرة المطلوبة", content: <FormattedText text={post.experience} /> },
        post.tasks && { id: 'tasks', icon: CheckSquare, title: "المهام المطلوبة", content: <FormattedText text={post.tasks} /> },
        post.featuresAndOpportunities && { id: 'featuresAndOpportunities', icon: Target, title: "المميزات والفرص", content: <FormattedText text={post.featuresAndOpportunities} /> },
        post.howToApply && { id: 'howToApply', icon: HelpCircle, title: "كيفية التقديم", content: <FormattedText text={post.howToApply} /> }
    ].filter(Boolean) as { id: string; icon: React.ElementType; title: string; content: React.ReactNode; }[];
    
    const hasDetails = !!descriptionSection || allOtherSections.length > 0;

    return (
        <div className="container mx-auto max-w-7xl px-4 pb-8 space-y-6">
            <Card className="overflow-hidden shadow-lg border-2" style={{ borderColor: sectionColor }}>
                 <CardHeader className="p-4" style={{ backgroundColor: `${sectionColor}1A`}}>
                    <div className="flex items-center gap-4 mb-2">
                       <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: `${iconColor}2A` }}>
                            <CategoryIcon name={iconName} className="h-6 w-6" style={{ color: iconColor }} />
                       </div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {post.title}
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm pt-2">
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            <span>
                                نُشرت: <TimeAgo date={post.createdAtISO || new Date().toISOString()} initialText={post.postedAt} />
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 space-y-6">
                     <div className="grid grid-cols-2 gap-3">
                        <InfoItem icon={LayoutGrid} label="نوع البرنامج" value={programDetails.label} color={iconColor} />
                        <InfoItem icon={MapPin} label="الموقع" value={`${post.targetCountry}${post.city ? ', ' + post.city : ''}`} color={iconColor} />
                        {post.positionsAvailable && <InfoItem icon={Users} label="عدد المناصب" value={post.positionsAvailable} color={iconColor} />}
                        <InfoItem icon={Users} label="الفئة المستهدفة" value={post.targetAudience} color={iconColor} />
                         {post.salary && <InfoItem icon={Wallet} label="الأجر" value={post.salary} color={iconColor} />}
                        {post.deadline && <InfoItem icon={CalendarDays} label="آخر أجل" value={post.deadline} color={iconColor} />}
                    </div>
                    
                    {hasDetails && (
                        <>
                            <Separator />
                            <div className="space-y-8">
                                {descriptionSection && (
                                    <DetailSection icon={descriptionSection.icon} title={descriptionSection.title} color={sectionColor}>
                                        {descriptionSection.content}
                                    </DetailSection>
                                )}
                                {allOtherSections.map((section, index) => (
                                    <React.Fragment key={section.id}>
                                        {(index > 0 || !!descriptionSection) && <Separator />}
                                        <DetailSection icon={section.icon} title={section.title} color={sectionColor}>{section.content}</DetailSection>
                                    </React.Fragment>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-xl font-bold">
                        <LinkIcon className="h-5 w-5" style={{ color: sectionColor }}/>
                        التقديم على الفرصة
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 pt-0">
                    {post.applyUrl && (
                        <Button asChild size="lg" className="text-primary-foreground font-semibold text-base py-6 active:scale-95 transition-transform" style={{backgroundColor: sectionColor}}>
                            <a href={post.applyUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-90">
                                <LinkIcon className="ml-2 h-5 w-5" />
                                الذهاب إلى رابط التسجيل
                            </a>
                        </Button>
                    )}
                    {contactButtons.map(button => {
                        if (!button) return null;
                        return (
                        <Button key={button.type} asChild size="lg" className={cn("text-primary-foreground font-semibold text-base py-6 active:scale-95 transition-transform", button.className)}>
                            <a href={button.href} target={button.type !== 'phone' ? '_blank' : undefined} rel="noopener noreferrer">
                                <button.icon className="ml-2 h-5 w-5" />
                                {button.label}
                            </a>
                        </Button>
                    )})}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-xl font-bold">
                        <Bookmark className="h-5 w-5" style={{ color: sectionColor }}/>
                        احفظ الإعلان وشارك مع الآخرين
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-0">
                    <SaveAdButton adId={post.id} adType="immigration" />
                    <ShareButton title={post.title || ''} text={post.description || ''} />
                </CardContent>
            </Card>
            
            <div className="text-center">
                <ReportAdDialog adId={post.id} />
            </div>

             {similarPosts.length > 0 && (
                <div className="space-y-4 pt-6 mt-6 border-t">
                    <h2 className="text-2xl font-bold">فرص هجرة مشابهة</h2>
                    <div className="grid grid-cols-1 gap-4">
                    {similarPosts.map((similarPost) => (
                        <ImmigrationCard key={similarPost.id} post={similarPost} />
                    ))}
                    </div>
                </div>
            )}
        </div>
    );
}
