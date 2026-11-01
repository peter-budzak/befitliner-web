import Image from 'next/image';
import Link from 'next/link';
import {gatewayCopy} from '@/lib/role-gateway-copy';

const audiences = [
  {path: 'zacat', image: 'member-couple'},
  {path: 'trainers', image: 'trainer'},
  {path: 'gyms', image: 'gym'},
];

export default function RoleGateway({locale}: {locale: string}) {
  const t = gatewayCopy[locale] ?? gatewayCopy.en;
  const cards = t.cards;
  return (
    <section className="py-12 sm:py-16">
      <h1 className="mx-auto max-w-5xl text-balance text-center text-4xl font-bold leading-tight sm:text-5xl">{t.headline}</h1>
      <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-relaxed text-white/65">{t.subtitle}</p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {cards.map((card, i) => (
          <Link key={audiences[i].path} href={i === 0 ? '/sk/zacat' : `/${locale}/${audiences[i].path}`} className="group flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#211a33] to-[#15131c] transition hover:border-[#9a70ff] focus-visible:outline-2 focus-visible:outline-[#c4b5fd] motion-safe:hover:-translate-y-1">
            <div className="relative aspect-[3/2] overflow-hidden">
              <Image src={`/images/audiences/${audiences[i].image}.webp`} alt="" fill sizes="(max-width: 767px) 100vw, 33vw" priority={i === 0} className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#211a33]/70 via-transparent to-transparent" />
            </div>
            <div className="flex flex-1 flex-col p-6 sm:p-7">
              {card.label && <p className="mb-3 text-xs font-semibold tracking-[0.12em] text-[#b993ff]">{card.label}</p>}
              <h2 className="mb-4 text-2xl font-bold leading-snug">{card.title}</h2>
              {card.description && <p className="mb-7 text-base leading-relaxed text-white/65">{card.description}</p>}
              <span className="mt-auto flex min-h-12 items-center justify-between rounded-xl bg-[#7947ff] px-5 py-3 font-semibold">{card.cta}<span aria-hidden="true">→</span></span>
              <p className="mt-3 min-h-5 text-center text-xs text-white/60">{i === 1 ? t.free : ''}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
