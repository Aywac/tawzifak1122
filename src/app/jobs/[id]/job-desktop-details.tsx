
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Phone, MessageSquare, MapPin, Wallet, CalendarDays, Briefcase, Building2,
  Award, Users2, Clock, Instagram, Link as LinkIcon, GraduationCap, Mail, LayoutGrid, ClipboardList,
  FileText, CheckSquare, HelpCircle, Bookmark, Target
} from 'lucide-react';
import type { Job, WorkType } from '@/lib/types';
import { CategoryIcon } from '@/components/icons';
import { ShareButton } from './share-button';
import { ReportAdDialog } from './report-ad-dialog';
import { JobCard } from '@/components/job-card';
import { SaveAdButton } from './save-ad-button';
import { cn } from '@/lib/utils';
import { getCategoryById } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { TimeAgo } from '@/components/ui/time-ago';

const workTypeTranslations: { [key in WorkType]: string } = {
  full_time: 'دوام كامل',
  part_time: 'دوام جزئي',
  freelance: 'عمل حر',
  remote: 'عن بعد',
};

const InfoItem = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number | undefined; color?: string }) => {
    if (!value) return null;
    return (
      <div className="flex flex-col gap-1 p-3 bg-muted/50 rounded-lg text-center">
        <Icon className="h-6 w-6 mx-auto mb-1" style={{ color }} />
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-semibold text-sm">{String(value)}</dd>
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

const DetailSectionCard = ({ icon: Icon, title, color, children, className }: { icon: React.ElementType, title: string, color?: string, children: React.ReactNode, className?: string }) => {
    if (!children) return null;
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl" style={{color}}>
                    <Icon className="h-5 w-5" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
};

interface JobDesktopDetailsProps {
    job: Job;
    similarJobs: Job[];
}

export function JobDesktopDetails({ job, similarJobs }: JobDesktopDetailsProps) {
    const category = getCategoryById(job.categoryId || '');
    const categoryName = category?.name || job.categoryName;
    const translatedWorkType = job.workType ? workTypeTranslations[job.workType] : undefined;
    const sectionColor = '#0D47A1';
    const categoryColor = category?.color || sectionColor;
    const finalIconName = category?.iconName || 'Briefcase';

    const contactButtons = [
        job.phone && { type: 'phone', href: `tel:${job.phone}`, label: 'اتصال', icon: Phone, className: 'bg-[#0D47A1] hover:bg-[#0D47A1]/90' },
        job.whatsapp && { type: 'whatsapp', href: `https://wa.me/${job.whatsapp.replace(/\+/g, '')}`, label: 'واتساب', icon: MessageSquare, className: 'bg-green-600 hover:bg-green-700' },
        job.email && { type: 'email', href: `mailto:${job.email}`, label: 'البريد الإلكتروني', icon: Mail, className: 'bg-gray-600 hover:bg-gray-700' },
        job.instagram && { type: 'instagram', href: `https://instagram.com/${job.instagram.replace(/@/g, '')}`, label: 'إنستغرام', icon: Instagram, className: 'bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90' },
        job.applyUrl && { type: 'applyUrl', href: job.applyUrl, label: 'تسجيل عبر الموقع', icon: LinkIcon, className: 'bg-blue-600 hover:bg-blue-700' },
    ].filter(Boolean);

    const descriptionSection = job.description ? { id: 'description', icon: FileText, title: "وصف الوظيفة", content: <FormattedText text={job.description} /> } : null;

    const allOtherSections = [
        job.availablePositions && { id: 'availablePositions', icon: Briefcase, title: "الوظائف المتاحة", content: <FormattedText text={job.availablePositions} /> },
        job.conditions && { id: 'conditions', icon: ClipboardList, title: "الشروط المطلوبة", content: <FormattedText text={job.conditions} /> },
        job.qualifications && { id: 'qualifications', icon: GraduationCap, title: "المؤهلات المطلوبة", content: <FormattedText text={job.qualifications} /> },
        job.experience && { id: 'experience', icon: Award, title: "الخبرة المطلوبة", content: <FormattedText text={job.experience} /> },
        job.tasks && { id: 'tasks', icon: CheckSquare, title: "المهام المطلوبة", content: <FormattedText text={job.tasks} /> },
        job.featuresAndOpportunities && { id: 'featuresAndOpportunities', icon: Target, title: "المميزات والفرص", content: <FormattedText text={job.featuresAndOpportunities} /> },
        job.howToApply && { id: 'howToApply', icon: HelpCircle, title: "كيفية التقديم", content: <FormattedText text={job.howToApply} /> }
    ].filter(Boolean) as { id: string; icon: React.ElementType; title: string; content: React.ReactNode; }[];
    

    return (
        <div className="container mx-auto max-w-5xl px-4 pb-8 space-y-6">
            <Card className="overflow-hidden shadow-lg border-t-4" style={{ borderColor: sectionColor }}>
                <CardHeader className="bg-muted/30 p-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: `${categoryColor}1A` }}>
                            <CategoryIcon name={finalIconName} className="h-8 w-8" style={{ color: categoryColor }} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                            {job.title || 'عنوان غير متوفر'}
                        </h1>
                    </div>
                     <div className="flex items-center gap-x-4 text-muted-foreground text-sm">
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            <span>
                                نُشر: <TimeAgo date={job.createdAtISO || new Date().toISOString()} initialText={job.postedAt} />
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        <InfoItem icon={MapPin} label="الموقع" value={`${job.country}, ${job.city}`} color={categoryColor} />
                        <InfoItem icon={Wallet} label="الأجر" value={job.salary ? job.salary : 'عند الطلب'} color={categoryColor} />
                        {categoryName && <InfoItem icon={LayoutGrid} label="الفئة" value={categoryName} color={categoryColor} />}
                        {translatedWorkType && <InfoItem icon={Clock} label="نوع الدوام" value={translatedWorkType} color={categoryColor} />}
                        {job.companyName && <InfoItem icon={Building2} label="الشركة" value={job.companyName} color={categoryColor} />}
                        {job.openPositions && <InfoItem icon={Users2} label="عدد المناصب" value={job.openPositions} color={categoryColor} />}
                    </div>

                    {descriptionSection && (
                        <>
                            <Separator className="my-6" />
                            <DetailSectionCard 
                                icon={descriptionSection.icon} 
                                title={descriptionSection.title} 
                                color={sectionColor}
                                className="col-span-full"
                            >
                                {descriptionSection.content}
                            </DetailSectionCard>
                        </>
                    )}
                    
                    {allOtherSections.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                {allOtherSections.map((section, index) => (
                                    <DetailSectionCard 
                                        key={section.id} 
                                        icon={section.icon} 
                                        title={section.title} 
                                        color={sectionColor}
                                        className={cn(allOtherSections.length % 2 !== 0 && index === allOtherSections.length - 1 && 'md:col-span-2')}
                                    >
                                        {section.content}
                                    </DetailSectionCard>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <LinkIcon className="h-5 w-5" style={{ color: sectionColor }}/>
                            <span className="text-foreground">التقديم على الوظيفة</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 grid grid-cols-1 gap-3">
                        {contactButtons.map(button => {
                            if (!button) return null;
                            return (
                                <Button
                                    key={button.type}
                                    asChild
                                    size="lg"
                                    className={cn("h-auto py-3 text-primary-foreground font-semibold text-base active:scale-95 transition-transform", button.className)}
                                >
                                    <a href={button.href} target={button.type !== 'phone' ? '_blank' : undefined} rel="noopener noreferrer">
                                        <button.icon className="ml-2 h-5 w-5" />
                                        {button.label}
                                    </a>
                                </Button>
                            )
                        })}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <Bookmark className="h-5 w-5" style={{ color: sectionColor }}/>
                            <span className="text-foreground">احفظ الإعلان وشارك مع الآخرين</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 pt-0">
                        <SaveAdButton adId={job.id} adType="job" />
                        <ShareButton title={job.title || ''} text={job.description || ''} />
                    </CardContent>
                </Card>
           </div>

            <div className="text-center pt-4">
                <ReportAdDialog adId={job.id} />
            </div>
            
             {similarJobs.length > 0 && (
                <div className="space-y-4 pt-6 mt-6 border-t">
                    <h2 className="text-2xl font-bold">إعلانات مشابهة</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {similarJobs.map((similarJob) => (
                            <JobCard key={similarJob.id} job={similarJob} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
