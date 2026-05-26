export const PLAN_DEFINITIONS = {
  FREE: {
    id: 'FREE',
    name: 'Starter',
    amountInPaise: 0,
    currency: 'INR',
    maxForms: 3,
    maxResponsesPerMonth: 100,
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    amountInPaise: 99900,
    currency: 'INR',
    maxForms: -1,
    maxResponsesPerMonth: 10000,
  },
  STUDIO: {
    id: 'STUDIO',
    name: 'Studio',
    amountInPaise: 299900,
    currency: 'INR',
    maxForms: -1,
    maxResponsesPerMonth: 50000,
  },
};

export const DEFAULT_PLAN_ID = 'FREE';

export function getPlan(planId) {
  return PLAN_DEFINITIONS[planId] ?? PLAN_DEFINITIONS[DEFAULT_PLAN_ID];
}

export function hasUnlimited(limit) {
  return limit === -1;
}
