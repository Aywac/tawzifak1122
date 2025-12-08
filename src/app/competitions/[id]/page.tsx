import React from 'react';
import { notFound } from 'next/navigation';
import { getCachedCompetitionById, getCompetitions } from '@/lib/data';
import type { Metadata } from 'next';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Landmark } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { CompetitionDesktopDetails } from './competition-desktop-details';
import { CompetitionMobileDetails } from './competition-mobile-details';


interface CompetitionDetailPageProps {
  params: { id: string };
}

interface JobPostingJsonLd {
  '@context': string;
  '@type': string;
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  hiringOrganization: {
    '@type': 'Organization';
    name: string;
    sameAs: string;
  };
  jobLocation: {
    '@type': 'Place';
    address: {
      '@type': 'PostalAddress';
      addressLocality: string;
      addressCountry: string;
    };
  };
  employmentType: string;
}

export async function generateMetadata({ params }: CompetitionDetailPageProps): Promise<Metadata> {
  const competition = await getCachedCompetitionById(params.id);
  const baseUrl = 'https://www.tawzifak.com';
  const siteThumbnail = 'https://i.postimg.cc/MH0BfvFB/og-image.jpg';
  
  if (!competition) {
    return {
      title: 'المباراة غير موجودة',
      description: 'لم نتمكن من العثور على المباراة التي تبحث عنها.',
      openGraph: { images: [{ url: siteThumbnail }] },
      twitter: { images: [siteThumbnail] }
    };
  }

  const metaTitle = competition.title || 'مباراة عمومية';
  const metaDescription = (competition.description || `مباراة منظمة من طرف ${competition.organizer}.`).substring(0, 160);
  const canonicalUrl = `${baseUrl}/competitions/${competition.id}`;
  const createdAtDate = competition.createdAt?.toDate ? competition.createdAt.toDate() : new Date();

  // Simplified and valid Structured Data
  const jobPostingJsonLd: JobPostingJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: metaTitle,
      description: metaDescription,
      datePosted: createdAtDate.toISOString(),
      hiringOrganization: {
        '@type': 'Organization',
        name: competition.organizer,
        sameAs: baseUrl,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: competition.location || 'المغرب',
          addressCountry: 'MA',
        },
      },
      employmentType: "FULL_TIME",
  };
  
  if (competition.deadline) {
    try {
        const deadlineDate = new Date(competition.deadline.split(' ')[0]);
        if (!isNaN(deadlineDate.getTime())) {
            jobPostingJsonLd.validThrough = deadlineDate.toISOString();
        }
    } catch(e) { /* ignore date parsing errors */ }
  }


  return {
    title: metaTitle,
    description: metaDescription,
    robots: 'index, follow',
    alternates: {
        canonical: canonicalUrl,
    },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: canonicalUrl,
        siteName: 'توظيفك',
        type: 'article',
        images: [ { url: siteThumbnail, width: 1200, height: 630, alt: metaTitle } ],
    },
    twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: [siteThumbnail],
    },
    other: {
        'application/ld+json': JSON.stringify(jobPostingJsonLd, null, 2)
    }
  };
}

export default async function CompetitionDetailPage({ params }: CompetitionDetailPageProps) {
    const competition = await getCachedCompetitionById(params.id);

    if (!competition) {
        notFound();
    }
    
    const { data: similarCompetitions } = await getCompetitions({ count: 3, excludeId: competition.id });

    return (
        <>
            <MobilePageHeader title="تفاصيل المباراة">
                <Landmark className="h-5 w-5 text-primary" />
            </MobilePageHeader>
            <DesktopPageHeader
                icon={Landmark}
                title="تفاصيل المباراة العمومية"
                description="هنا تجد جميع المعلومات المتعلقة بهذه المباراة."
            />

            {/* Mobile View */}
            <div className="block md:hidden">
                <CompetitionMobileDetails competition={competition} similarCompetitions={similarCompetitions} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <CompetitionDesktopDetails competition={competition} similarCompetitions={similarCompetitions} />
            </div>
        </>
    );
}
