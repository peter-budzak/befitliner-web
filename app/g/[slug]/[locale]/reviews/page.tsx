import type {Metadata} from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {robots: {index: false, follow: true}};

const LOCALES = ['en', 'sk', 'de', 'es', 'fr', 'zh-Hans'] as const;
type Locale = (typeof LOCALES)[number];

type PageProps = {
  params: Promise<{ slug: string; locale: string }> | { slug: string; locale: string };
};

type PublicGym = {
  id: string;
  slug: string;
  name: string;
  address: string | null;
};

type PublicGymReview = {
  id: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
};

type Copy = {
  back: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  noReviews: string;
  ratingLabel: string;
  powered: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    back: 'Back to gym',
    eyebrow: 'Member reviews',
    title: 'Reviews',
    subtitle: 'Read what members say about this gym. Reviews can only be written inside the Fitliner app.',
    noReviews: 'There are no reviews here yet.',
    ratingLabel: 'Rating',
    powered: 'Powered by Fitliner',
  },
  sk: {
    back: 'Späť na fitko',
    eyebrow: 'Recenzie členov',
    title: 'Recenzie',
    subtitle: 'Prečítaj si, čo hovoria členovia o tomto fitku. Recenziu je možné napísať iba v aplikácii Fitliner.',
    noReviews: 'Zatiaľ tu nie sú žiadne recenzie.',
    ratingLabel: 'Hodnotenie',
    powered: 'Vytvorené cez Fitliner',
  },
  de: {
    back: 'Zurück zum Gym',
    eyebrow: 'Bewertungen von Mitgliedern',
    title: 'Bewertungen',
    subtitle: 'Lies, was Mitglieder über dieses Gym sagen. Bewertungen können nur in der Fitliner App geschrieben werden.',
    noReviews: 'Hier gibt es noch keine Bewertungen.',
    ratingLabel: 'Bewertung',
    powered: 'Bereitgestellt von Fitliner',
  },
  es: {
    back: 'Volver al gimnasio',
    eyebrow: 'Reseñas de miembros',
    title: 'Reseñas',
    subtitle: 'Lee lo que dicen los miembros sobre este gimnasio. Las reseñas solo se pueden escribir dentro de la app Fitliner.',
    noReviews: 'Todavía no hay reseñas aquí.',
    ratingLabel: 'Valoración',
    powered: 'Desarrollado por Fitliner',
  },
  fr: {
    back: 'Retour à la salle',
    eyebrow: 'Avis des membres',
    title: 'Avis',
    subtitle: 'Lisez ce que les membres disent de cette salle. Les avis peuvent être écrits uniquement dans l’app Fitliner.',
    noReviews: 'Il n’y a pas encore d’avis ici.',
    ratingLabel: 'Note',
    powered: 'Propulsé par Fitliner',
  },
  'zh-Hans': {
    back: '返回健身房',
    eyebrow: '会员评价',
    title: '评价',
    subtitle: '阅读会员对这家健身房的评价。评价只能在 Fitliner 应用内发布。',
    noReviews: '这里还没有任何评价。',
    ratingLabel: '评分',
    powered: '由 Fitliner 提供支持',
  },
};

function getCopy(locale: string) {
  return COPY[LOCALES.includes(locale as Locale) ? (locale as Locale) : 'en'];
}

function formatDate(value: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale === 'zh-Hans' ? 'zh-Hans' : locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return '';
  }
}

export default async function PublicGymReviewsPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug, locale } = resolvedParams;

  if (!LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const copy = getCopy(locale);

  const [{ data: gym, error: gymError }, { data: reviews, error: reviewsError }] = await Promise.all([
    supabase
      .rpc('get_public_gym_by_slug', { input_slug: slug })
      .maybeSingle<PublicGym>(),
    supabase
      .rpc('get_public_gym_reviews_by_slug', { input_slug: slug }),
  ]);

  if (gymError || !gym) {
    console.error('Failed to load public gym for reviews:', gymError);
    notFound();
  }

  if (reviewsError) {
    console.error('Failed to load public gym reviews:', reviewsError);
  }

  const safeReviews = (reviews ?? []) as PublicGymReview[];

  return (
    <main className="min-h-screen bg-[#0B0B12] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-8 sm:px-8">
        <div className="mb-8">
          <Link
            href={`/g/${slug}/${locale}`}
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
          >
            ← {copy.back}
          </Link>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-6 inline-flex rounded-full bg-[#007A68]/25 px-4 py-2 text-sm font-semibold text-[#9FFFE8]">
            {copy.eyebrow}
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {copy.title}
          </h1>

          <p className="mt-3 text-xl font-bold text-white/80">
            {gym.name}
          </p>

          {gym.address ? (
            <p className="mt-2 text-sm leading-6 text-white/50">
              {gym.address}
            </p>
          ) : null}

          <p className="mt-6 text-base leading-7 text-white/70">
            {copy.subtitle}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {safeReviews.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/60">
              {copy.noReviews}
            </div>
          ) : (
            safeReviews.map((review) => (
              <article
                key={review.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">{review.title}</h2>
                    <p className="mt-1 text-xs text-white/45">
                      {formatDate(review.created_at, locale)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#007A68]/25 px-3 py-2 text-sm font-black text-[#9FFFE8]">
                    {review.rating.toFixed(1)}
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-white/70">
                  {review.body}
                </p>
              </article>
            ))
          )}
        </div>

        <footer className="mt-auto pt-10 text-center text-xs text-white/35">
          {copy.powered}
        </footer>
      </section>
    </main>
  );
}
