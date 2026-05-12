import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type PageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

type PublicGym = {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  timezone: string;
  currency: string;
  rules_text: string | null;
};

function cleanUrl(value: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  return trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`;
}

function mapUrl(address: string | null) {
  if (!address) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export default async function PublicGymPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = resolvedParams.slug;

  const { data, error } = await supabase
    .rpc('get_public_gym_by_slug', { input_slug: slug })
    .maybeSingle<PublicGym>();

  if (error) {
    console.error('Failed to load public gym page:', error);
    notFound();
  }

  if (!data) {
    notFound();
  }

  const gym = data;
  const addressMapUrl = mapUrl(gym.address);
  const websiteUrl = cleanUrl(gym.website);
  const facebookUrl = cleanUrl(gym.facebook);
  const instagramUrl = cleanUrl(gym.instagram);
  const tiktokUrl = cleanUrl(gym.tiktok);

  return (
    <main className="min-h-screen bg-[#0B0B12] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-8 sm:px-8">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link href="/en" className="text-sm font-semibold text-white/70 hover:text-white">
            Fitliner
          </Link>

          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
            Public gym page
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-6 inline-flex rounded-full bg-[#7C4DFF]/15 px-4 py-2 text-sm font-semibold text-[#BBA7FF]">
            Open with Fitliner
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {gym.name}
          </h1>

          {gym.address ? (
            <p className="mt-4 text-lg leading-7 text-white/72">
              {gym.address}
            </p>
          ) : null}

          <p className="mt-6 text-base leading-7 text-white/70">
            Download the Fitliner app, choose your membership or entry pass, and open the gym with your phone.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href="#"
              className="flex items-center justify-center rounded-2xl bg-[#7C4DFF] px-5 py-4 text-center text-sm font-bold text-white transition hover:bg-[#6B3DFF]"
            >
              Download for iPhone
            </a>

            <a
              href="#"
              className="flex items-center justify-center rounded-2xl bg-white px-5 py-4 text-center text-sm font-bold text-[#111]"
            >
              Download for Android
            </a>
          </div>

          <p className="mt-4 text-center text-xs text-white/45">
            iOS & Android · Free to start
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-bold">Address</h2>

            <p className="mt-2 text-sm leading-6 text-white/65">
              {gym.address || 'Address is not available yet.'}
            </p>

            {addressMapUrl ? (
              <a
                href={addressMapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                Navigate
              </a>
            ) : null}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-bold">Contact</h2>

            <div className="mt-2 space-y-2 text-sm leading-6 text-white/65">
              {gym.contact_phone ? <p>Phone: {gym.contact_phone}</p> : null}
              {gym.contact_email ? <p>Email: {gym.contact_email}</p> : null}

              {!gym.contact_phone && !gym.contact_email ? (
                <p>Contact details are not available yet.</p>
              ) : null}
            </div>
          </div>
        </div>

        {websiteUrl || facebookUrl || instagramUrl || tiktokUrl ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-bold">Links</h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {websiteUrl ? (
                <a href={websiteUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                  Website
                </a>
              ) : null}

              {facebookUrl ? (
                <a href={facebookUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                  Facebook
                </a>
              ) : null}

              {instagramUrl ? (
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                  Instagram
                </a>
              ) : null}

              {tiktokUrl ? (
                <a href={tiktokUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
                  TikTok
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {gym.rules_text?.trim() ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-bold">Gym rules</h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/65">
              {gym.rules_text}
            </p>
          </div>
        ) : null}

        <footer className="mt-auto pt-10 text-center text-xs text-white/35">
          Powered by Fitliner · {gym.currency} · {gym.timezone}
        </footer>
      </section>
    </main>
  );
}
