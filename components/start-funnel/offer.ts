export type PlanId = 'monthly' | 'annual';

export const startPlans = [
  { id: 'monthly', priceMinor: 700, months: 1 },
  { id: 'annual', priceMinor: 3600, months: 12 },
] as const;
