export type Goal = 'weight' | 'strength' | 'fitness' | 'restart';
export type Venue = 'home' | 'gym';
export type Location = Venue | 'both';
export type Minutes = 15 | 25 | 40;
export type Step = 'intro' | 'benefits' | 'goal' | 'location' | 'time' | 'preview' | 'offer';

export const steps: Step[] = ['intro', 'benefits', 'goal', 'location', 'time', 'preview', 'offer'];

export const goals = [
  { id: 'weight', title: 'Schudnúť', detail: 'Viac pohybu a lepší prehľad o jedle' },
  { id: 'strength', title: 'Byť silnejší', detail: 'Nabrať silu a svaly' },
  { id: 'fitness', title: 'Zlepšiť kondíciu', detail: 'Viac sa hýbať a ľahšie zvládať námahu' },
  { id: 'restart', title: 'Začať alebo sa vrátiť', detail: 'Nájsť rytmus, ktorý mi vydrží' },
] as const;

export const locations = [
  { id: 'home', title: 'Doma', detail: 'Začnem s tým, čo mám' },
  { id: 'gym', title: 'Vo fitku', detail: 'Chcem využiť činky alebo stroje' },
  { id: 'both', title: 'Doma aj vo fitku', detail: 'Miesto vyberiem podľa dňa' },
] as const;

export const times = [
  { minutes: 15, detail: 'Keď mám voľnú len chvíľu', warmup: 3, main: 9, finish: 3 },
  { minutes: 25, detail: 'Čas na rozcvičku aj hlavné cviky', warmup: 5, main: 16, finish: 4 },
  { minutes: 40, detail: 'Viac priestoru aj na prestávky', warmup: 7, main: 27, finish: 6 },
] as const;

const workouts: Record<Venue, Record<Goal, [string, string, string]>> = {
  home: {
    weight: ['Svižná chôdza na mieste', 'Drep na stoličku', 'Krok do strany'],
    strength: ['Drep na stoličku', 'Kľuk o pevnú oporu', 'Zdvíhanie panvy'],
    fitness: ['Svižná chôdza na mieste', 'Výstupy na nízky schod', 'Krok do strany'],
    restart: ['Vstávanie zo stoličky', 'Kľuk o stenu', 'Zdvíhanie panvy'],
  },
  gym: {
    weight: ['Chôdza na páse', 'Leg press', 'Stacionárny bicykel'],
    strength: ['Leg press', 'Tlaky s jednoručkami', 'Príťahy na kladke'],
    fitness: ['Chôdza na páse', 'Stacionárny bicykel', 'Eliptický trenažér'],
    restart: ['Chôdza na páse', 'Leg press', 'Príťahy v sede'],
  },
};

export function workoutPreview(venue: Venue, goal: Goal, minutes: Minutes) {
  const timing = times.find((option) => option.minutes === minutes)!;
  return { ...timing, exercises: workouts[venue][goal] };
}

export const benefits = [
  ['Tréning', 'Plán doma aj vo fitku, ukážky cvikov a denník sérií, opakovaní a váh.'],
  ['Strava a AI tréner', 'Zapisuj si jedlá. AI tréner ti kedykoľvek pomôže prispôsobiť tréning a stravu tvojmu dňu.'],
  ['Progres a zdravotná karta', 'Porovnaj tréningy, merania z diagnostickej váhy aj staršie krvné výsledky.'],
  ['Tréneri a komunita', 'Vyhľadaj si trénera, rezervuj tréning alebo napíš ľuďom z okolia cez Messenger.'],
] as const;

// Add the final artwork under public/images/start-funnel and register its path and alt text here.
export const artwork: Partial<Record<Step | `time-${Venue}` | `preview-${Venue}`, { src: string; alt: string }>> = {};
