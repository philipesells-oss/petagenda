import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://getpetflow.com'),
  title: {
    default: 'PetFlow — Sistema para Pet Shop e Clínica Veterinária',
    template: '%s | PetFlow',
  },
  description:
    'Sistema completo para pet shop e clínica veterinária. Agendamento online com QR Code, agenda por profissional, ficha de clientes e pets, dashboard de faturamento. R$29,90/mês com 7 dias de garantia.',
  keywords: [
    'sistema para pet shop',
    'software pet shop',
    'agenda para pet shop',
    'agendamento online pet shop',
    'sistema agendamento veterinário',
    'crm pet shop',
    'software gestão petshop',
    'agenda veterinária online',
    'sistema clínica veterinária',
    'aplicativo para pet shop',
    'sistema de agendamento pet shop',
    'agenda petshop online',
    'software para pet shop',
    'petflow',
    'pet shop sistema',
  ],
  authors: [{ name: 'PetFlow', url: 'https://getpetflow.com' }],
  creator: 'PetFlow',
  publisher: 'PetFlow',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    alternateLocale: ['pt_PT', 'en_US'],
    url: 'https://getpetflow.com',
    siteName: 'PetFlow',
    title: 'PetFlow — Sistema para Pet Shop e Clínica Veterinária',
    description:
      'Agendamento online com QR Code, agenda por profissional, ficha de clientes e pets, faturamento em tempo real. R$29,90/mês · 7 dias de garantia · Suporte em português.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'PetFlow — Sistema para Pet Shop e Clínica Veterinária',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PetFlow — Sistema para Pet Shop e Clínica Veterinária',
    description:
      'Agendamento online com QR Code para pet shops e clínicas vet. R$29,90/mês · 7 dias de garantia.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: 'https://getpetflow.com',
    languages: {
      'pt-BR': 'https://getpetflow.com',
      'pt-PT': 'https://getpetflow.com',
      'en': 'https://getpetflow.com',
      'x-default': 'https://getpetflow.com',
    },
  },
  verification: {
    google: 'xLSZM8IHwW-0UHjY39IfbXCzwLw2uJ5MR1ufERPb8RU',
  },
};

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
        {children}
        </LanguageProvider>
        {PIXEL_ID && (
          <>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
            <Script id="meta-pixel" strategy="afterInteractive">{`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${PIXEL_ID}');
              fbq('track', 'PageView');
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}
