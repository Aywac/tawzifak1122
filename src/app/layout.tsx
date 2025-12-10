import type { Metadata } from 'next';  
import { Tajawal } from 'next/font/google';  
import { Toaster } from "@/components/ui/toaster";  
import './globals.css';  
import { AuthProvider } from '@/context/auth-context';  
import { ThemeProvider } from '@/components/theme-provider';  
import { cn } from '@/lib/utils';  
import { AppLayout } from '@/components/layout/app-layout';  
import Script from 'next/script';  
  
const tajawal = Tajawal({  
  subsets: ['arabic'],  
  weight: ['200', '300', '400', '500', '700', '800', '900'],  
  variable: '--font-tajawal',  
  display: 'swap',  
});  
  
const baseUrl = 'https://www.tawzifak.com';  
const appName = 'توظيفك';  
const appDescription = "تعرّف على أفضل عروض العمل وفرص الهجرة القانونية والمباريات العمومية بسهولة وموثوقية. اعثر على الفرص التي تناسب مهاراتك وطموحاتك المهنية بسرعة وفعالية وابدأ رحلتك نحو مستقبل مهني ناجح";  
const appOgImage = 'https://www.tawzifak.com/og-image.jpg';  
  
export const metadata: Metadata = {  
  metadataBase: new URL(baseUrl),  
  title: {  
    default: appName,  
    template: `%s | ${appName}`  
  },  
  description: appDescription,  
  icons: {  
    icon: [  
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },  
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },  
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },  
    ],  
    apple: [  
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },  
    ],  
  },  
  manifest: "/site.webmanifest",  
  alternates: {  
    canonical: '/',  
  },  
  openGraph: {  
    title: {  
      default: appName,  
      template: `%s | ${appName}`  
    },  
    description: appDescription,  
    url: '/',  
    siteName: appName,  
    images: [  
      {  
        url: appOgImage,  
        width: 1200,  
        height: 630,  
        alt: appName,  
      },  
    ],  
    type: 'website',  
  },  
  twitter: {  
    card: 'summary_large_image',  
    title: {  
      default: appName,  
      template: `%s | ${appName}`  
    },  
    description: appDescription,  
    images: [appOgImage],  
  },  
};  
  
export default function RootLayout({  
  children,  
}: Readonly<{  
  children: React.ReactNode;  
}>) {  
  const orgSchema = {  
    '@context': 'https://schema.org',  
    '@type': 'Organization',  
    name: appName,  
    url: baseUrl,  
    logo: appOgImage,  
  };  
  
  const webSiteSchema = {  
    '@context': 'https://schema.org',  
    '@type': 'WebSite',  
    name: appName,  
    url: baseUrl,  
    potentialAction: {  
      '@type': 'SearchAction',  
      target: `${baseUrl}/jobs?q={search_term_string}`,  
      'query-input': 'required name=search_term_string',  
    },  
  };  
  
  return (  
    <html lang="ar" dir="rtl" suppressHydrationWarning>  
      <head>  
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />  

        <Script  
          id="adsbygoogle-init"
          strategy="afterInteractive"  
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6413953433245789"  
          crossOrigin="anonymous"  
        ></Script>  

        <script  
          type="application/ld+json"  
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}  
        />  
        <script  
          type="application/ld+json"  
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}  
        />  
      </head>  
      <body className={cn("antialiased", tajawal.variable)}>  
        <Script  
          id="gtag-manager"  
          strategy="afterInteractive"  
          src="https://www.googletagmanager.com/gtag/js?id=G-FE0MP7XYXM"  
        />  
        <Script id="gtag-inline" strategy="afterInteractive">  
          {`  
            window.dataLayer = window.dataLayer || [];  
            function gtag(){dataLayer.push(arguments);}  
            gtag('js', new Date());  
            gtag('config', 'G-FE0MP7XYXM');  
          `}  
        </Script>  
        <ThemeProvider  
          attribute="class"  
          defaultTheme="light"  
          disableTransitionOnChange  
        >  
          <AuthProvider>  
            <AppLayout>{children}</AppLayout>  
            <Toaster />  
          </AuthProvider>  
        </ThemeProvider>  
      </body>  
    </html>  
  );  
        }
