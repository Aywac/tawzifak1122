
import React from 'react';
import { notFound } from 'next/navigation';
import { getCachedJobById, getJobOffers } from '@/lib/data';
import type { Metadata } from 'next';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Briefcase } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { JobDesktopDetails } from './job-desktop-details';
import { JobMobileDetails } from './job-mobile-details';
import type { Job, WorkType } from '@/lib/types';


interface JobDetailPageProps {
  params: { id: string };
}

interface JobPostingJsonLd {
  '@context': string;
  '@type': string;
  title: string;
  description: string;
  identifier?: {
    '@type': 'PropertyValue';
    name: string;
    value: string;
  };
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
  employmentType?: string;
  baseSalary?: {
    '@type': 'MonetaryAmount';
    currency: string;
    value: {
      '@type': 'QuantitativeValue';
      value: string;
      unitText: string;
    };
  };
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const job = await getCachedJobById(params.id);
  const baseUrl = 'https://www.tawzifak.com';
  const siteThumbnail = 'https://i.postimg.cc/MH0BfvFB/og-image.jpg';
  
  if (!job) {
    return {
      title: 'الإعلان غير موجود',
      description: 'لم نتمكن من العثور على الإعلان الذي تبحث عنه.',
      openGraph: { images: [{ url: siteThumbnail }] },
      twitter: { images: [siteThumbnail] }
    };
  }
  
  const jobTitle = job.title || 'إعلان وظيفة';
  const jobCity = job.city || 'مدينة غير محددة';
  const jobCountry = job.country || 'دولة غير محددة';
  const metaDescription = (job.description || `${jobTitle} في ${jobCity}, ${jobCountry}.`).substring(0, 160);
  const createdAtDate = (job.createdAt && typeof job.createdAt.toDate === 'function') 
    ? job.createdAt.toDate() 
    : new Date();

  // Construct simplified and valid structured data
  const jobPostingJsonLd: JobPostingJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: jobTitle,
      description: metaDescription,
      datePosted: createdAtDate.toISOString(),
      hiringOrganization: {
        '@type': 'Organization',
        name: job.companyName || 'توظيفك',
        sameAs: baseUrl,
      },
      jobLocation: {
          '@type': 'Place',
          address: {
              '@type': 'PostalAddress',
              addressLocality: job.city,
              addressCountry: job.country,
          },
      },
  };

  const workTypeMapping: { [key in WorkType]: string } = {
    full_time: 'FULL_TIME',
    part_time: 'PART_TIME',
    freelance: 'CONTRACTOR',
    remote: 'REMOTE'
  };

  if (job.workType && workTypeMapping[job.workType]) {
      jobPostingJsonLd.employmentType = workTypeMapping[job.workType];
  }
  
  const expiryDate = new Date(createdAtDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Set expiry to 1 year from posting
  jobPostingJsonLd.validThrough = expiryDate.toISOString();


  const canonicalUrl = `${baseUrl}/jobs/${job.id}`;

  return {
    title: jobTitle,
    description: metaDescription,
    robots: 'index, follow',
    alternates: {
        canonical: canonicalUrl,
    },
    openGraph: {
        title: jobTitle,
        description: metaDescription,
        url: canonicalUrl,
        siteName: 'توظيفك',
        type: 'article',
        images: [{ url: siteThumbnail, width: 1200, height: 630, alt: jobTitle }],
    },
    twitter: {
        card: 'summary_large_image',
        title: jobTitle,
        description: metaDescription,
        images: [siteThumbnail],
    },
    other: {
        'application/ld+json': JSON.stringify(jobPostingJsonLd, null, 2)
    }
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
    const job = await getCachedJobById(params.id);

    if (!job || job.postType !== 'seeking_worker') {
        notFound();
    }

    const { data: similarJobs } = await getJobOffers({
        categoryId: job.categoryId,
        count: 3,
        excludeId: job.id,
    });
    
    return (
        <>
            {/* Common Headers for both mobile and desktop */}
            <MobilePageHeader title="تفاصيل عرض العمل">
                <Briefcase className="h-5 w-5 text-primary" />
            </MobilePageHeader>
            <DesktopPageHeader
                icon={Briefcase}
                title="تفاصيل عرض العمل"
                description="هنا تجد جميع المعلومات المتعلقة بفرصة العمل هذه."
            />

            {/* Mobile View */}
            <div className="block md:hidden">
                <JobMobileDetails job={job} similarJobs={similarJobs} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <JobDesktopDetails job={job} similarJobs={similarJobs} />
            </div>
        </>
    );
}
