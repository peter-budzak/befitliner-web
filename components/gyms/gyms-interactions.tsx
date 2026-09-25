'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';
import dynamic from 'next/dynamic';
import {ensureMetaPixel, MARKETING_CONSENT_KEY} from '@/lib/meta-pixel';
import type {GymsCopy} from '@/lib/gyms';

const GymsFunnel = dynamic(() => import('./gyms-funnel'));
type EventName =
  | 'gyms_landing_view'
  | 'gyms_vsl_play'
  | 'gyms_vsl_25'
  | 'gyms_vsl_50'
  | 'gyms_vsl_75'
  | 'gyms_vsl_complete'
  | 'gyms_primary_cta_click'
  | 'gyms_existing_system_cta_click'
  | 'gyms_starter_order_start'
  | 'gyms_call_cta_click'
  | 'gyms_faq_interaction';

function allowed() {
  try {
    return localStorage.getItem(MARKETING_CONSENT_KEY) !== 'rejected';
  } catch {
    return false;
  }
}
export function trackGymEvent(
  event: EventName,
  parameters: Record<string, string | number> = {},
) {
  if (allowed()) window.fbq?.('trackCustom', event, parameters);
}

export function GymLink({
  href,
  location,
  event = 'gyms_primary_cta_click',
  order = false,
  className,
  children,
}: {
  href: string;
  location: string;
  event?: EventName;
  order?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        trackGymEvent(event, {location});
        if (order)
          trackGymEvent('gyms_starter_order_start', {
            location,
            value: 297,
            currency: 'EUR',
          });
      }}
    >
      {children}
    </a>
  );
}

export function GymVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const sent = useRef(new Set<string>());
  function once(event: EventName) {
    if (!allowed() || sent.current.has(event)) return;
    sent.current.add(event);
    trackGymEvent(event);
  }
  return (
    <video
      controls
      playsInline
      preload="none"
      poster={poster}
      aria-label={label}
      onPlay={() => once('gyms_vsl_play')}
      onTimeUpdate={({currentTarget: video}) => {
        if (
          !Number.isFinite(video.duration) ||
          video.duration <= 0 ||
          video.seeking
        )
          return;
        const percentage = (video.currentTime / video.duration) * 100;
        for (const milestone of [25, 50, 75] as const) {
          if (percentage >= milestone) once(`gyms_vsl_${milestone}`);
        }
      }}
      onEnded={() => once('gyms_vsl_complete')}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

export function GymFaq({items}: {items: string[][]}) {
  return (
    <div className="gym-faq">
      {items.map(([question, answer], index) => (
        <details
          key={question}
          onToggle={(event) => {
            if (event.currentTarget.open)
              trackGymEvent('gyms_faq_interaction', {question_index: index});
          }}
        >
          <summary>
            {question}
            <span aria-hidden="true">+</span>
          </summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
}

export function GymQualification({
  locale,
  copy,
}: {
  locale: string;
  copy: GymsCopy;
}) {
  const [open, setOpen] = useState(false);
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const reveal = () => {
      if (window.location.hash === '#compatibility' && details.current)
        details.current.open = true;
    };
    reveal();
    window.addEventListener('hashchange', reveal);
    return () => window.removeEventListener('hashchange', reveal);
  }, []);
  return (
    <details
      ref={details}
      id="compatibility"
      className="gym-qualification"
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>
        {copy.qualificationTitle}
        <span aria-hidden="true"> +</span>
      </summary>
      <p>{copy.qualificationBody}</p>
      {open && (
        <GymsFunnel
          locale={locale}
          assessmentOnly
          resultCopy={copy.qualificationDone}
        />
      )}
    </details>
  );
}

export function GymTracking({copy, locale}: {copy: GymsCopy; locale: string}) {
  const [choice, setChoice] = useState<string | null>(null);
  const [sticky, setSticky] = useState(false);
  const viewed = useRef(false);
  function recordView() {
    ensureMetaPixel();
    if (!viewed.current) {
      viewed.current = true;
      trackGymEvent('gyms_landing_view', {locale});
    }
  }
  useEffect(() => {
    let saved = '';
    try {
      saved = localStorage.getItem(MARKETING_CONSENT_KEY) || 'default';
    } catch {
      /* Measurement remains disabled. */
    }
    setChoice(saved);
    if (allowed()) recordView();
    const hero = document.getElementById('gym-hero');
    const observer = new IntersectionObserver(([entry]) =>
      setSticky(!entry.isIntersecting && entry.boundingClientRect.bottom < 0),
    );
    if (hero) observer.observe(hero);
    return () => observer.disconnect();
    // A view belongs to this mounted locale, not to consent panel rerenders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);
  function choose(value: string) {
    try {
      localStorage.setItem(MARKETING_CONSENT_KEY, value);
    } catch {
      /* Do not track if the preference cannot be saved. */
    }
    setChoice(value);
    if (value === 'accepted' && allowed()) {
      window.fbq?.('consent', 'grant');
      recordView();
    }
    if (value === 'rejected') window.fbq?.('consent', 'revoke');
  }
  return (
    <>
      <div
        className={`gym-consent ${choice === '' ? 'gym-consent-prompt' : ''}`}
      >
        {choice === '' ? (
          <>
            <p>{copy.consent}</p>
            <div>
              <button onClick={() => choose('rejected')}>{copy.reject}</button>
              <button onClick={() => choose('accepted')}>{copy.accept}</button>
            </div>
          </>
        ) : (
          <button onClick={() => setChoice('')}>{copy.settings}</button>
        )}
      </div>
      {sticky && choice !== '' && choice !== null && (
        <div className="gym-sticky">
          <GymLink href="#offer" location="sticky" className="gym-button">
            {copy.sticky}
            <span aria-hidden="true">↗</span>
          </GymLink>
        </div>
      )}
    </>
  );
}
