import type { Metadata } from 'next';
import GymsFunnel from '@/components/gyms/gyms-funnel';

const metadataByLocale = {
  sk: {
    title: 'Fitliner pre fitnesscentrá – automatický vstup, platby a viac členov',
    description:
      'Zistite, ako môže Fitliner pomôcť vášmu fitnesscentru automatizovať vstup, prijímať platby online a získať viac členov bez zložitej prevádzky.',
    image: '/images/gyms/sk-poster.jpg',
    url: 'https://befitliner.com/sk/gyms'
  },
  en: {
    title: 'Fitliner for Gyms – automated access, payments and member growth',
    description:
      'Discover how Fitliner helps gyms automate door access, accept online payments and grow memberships with one simple system.',
    image: '/images/gyms/sk-poster.jpg',
    url: 'https://befitliner.com/en/gyms'
  }
} as const;

type Locale = keyof typeof metadataByLocale;

type PageProps = {
  params: Promise<{ locale: string }>;
};

function getLocaleMetadata(locale: string) {
  return metadataByLocale[locale as Locale] ?? metadataByLocale.en;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const pageMetadata = getLocaleMetadata(locale);

  return {
    title: pageMetadata.title,
    description: pageMetadata.description,
    alternates: {
      canonical: pageMetadata.url,
      languages: {
        sk: 'https://befitliner.com/sk/gyms',
        en: 'https://befitliner.com/en/gyms'
      }
    },
    openGraph: {
      title: pageMetadata.title,
      description: pageMetadata.description,
      url: pageMetadata.url,
      siteName: 'Fitliner',
      type: 'website',
      locale: locale === 'sk' ? 'sk_SK' : 'en_US',
      images: [
        {
          url: pageMetadata.image,
          width: 1200,
          height: 630,
          alt: pageMetadata.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: pageMetadata.title,
      description: pageMetadata.description,
      images: [pageMetadata.image]
    }
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  return (
    <main className="min-h-screen bg-[#0B0B0D] text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <GymsFunnel locale={locale} />
      </div>
    </main>
  );
}