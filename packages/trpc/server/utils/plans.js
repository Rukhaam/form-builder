export const DEFAULT_PLAN_ID = "FREE";

export const PLAN_DEFINITIONS = {
  FREE: {
    id: "FREE",
    tier: "starter",
    name: "Starter",
    billingCycle: "free",
    amountInPaise: 0,
    currency: "INR",
    displayPrice: "INR 0",
    cadence: "forever",
    maxForms: 3,
    maxResponsesPerMonth: 100,
    razorpayPlanId: null,
    totalCount: null,
  },
  PRO_MONTHLY: {
    id: "PRO_MONTHLY",
    tier: "pro",
    name: "Pro",
    billingCycle: "monthly",
    amountInPaise: 90000,
    currency: "INR",
    displayPrice: "INR 900",
    cadence: "per month",
    maxForms: -1,
    maxResponsesPerMonth: 10000,
    razorpayPlanId: process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID,
    totalCount: 1200,
  },
  PRO_YEARLY: {
    id: "PRO_YEARLY",
    tier: "pro",
    name: "Pro",
    billingCycle: "yearly",
    amountInPaise: 900000,
    currency: "INR",
    displayPrice: "INR 9,000",
    cadence: "per year",
    maxForms: -1,
    maxResponsesPerMonth: 10000,
    razorpayPlanId: process.env.RAZORPAY_PRO_YEARLY_PLAN_ID,
    totalCount: 100,
  },
  BUSINESS_MONTHLY: {
    id: "BUSINESS_MONTHLY",
    tier: "business",
    name: "Business",
    billingCycle: "monthly",
    amountInPaise: 250000,
    currency: "INR",
    displayPrice: "INR 2,500",
    cadence: "per month",
    maxForms: -1,
    maxResponsesPerMonth: 50000,
    razorpayPlanId: process.env.RAZORPAY_BUSINESS_MONTHLY_PLAN_ID,
    totalCount: 1200,
  },
  BUSINESS_YEARLY: {
    id: "BUSINESS_YEARLY",
    tier: "business",
    name: "Business",
    billingCycle: "yearly",
    amountInPaise: 2500000,
    currency: "INR",
    displayPrice: "INR 25,000",
    cadence: "per year",
    maxForms: -1,
    maxResponsesPerMonth: 50000,
    razorpayPlanId: process.env.RAZORPAY_BUSINESS_YEARLY_PLAN_ID,
    totalCount: 100,
  },
};

const LEGACY_PLAN_ALIASES = {
  PRO: "PRO_MONTHLY",
  STUDIO: "BUSINESS_MONTHLY",
};

export const PAID_PLAN_IDS = Object.keys(PLAN_DEFINITIONS).filter(
  (planId) => planId !== DEFAULT_PLAN_ID,
);

export function resolvePlanId(planId) {
  return LEGACY_PLAN_ALIASES[planId] || planId || DEFAULT_PLAN_ID;
}

export function getPlan(planId) {
  return (
    PLAN_DEFINITIONS[resolvePlanId(planId)] ?? PLAN_DEFINITIONS[DEFAULT_PLAN_ID]
  );
}

export function getPaidPlan(planId) {
  const plan = PLAN_DEFINITIONS[resolvePlanId(planId)];
  if (!plan || plan.id === DEFAULT_PLAN_ID || !plan.razorpayPlanId) return null;
  return plan;
}

export function getPlanByRazorpayPlanId(razorpayPlanId) {
  return (
    Object.values(PLAN_DEFINITIONS).find(
      (plan) => plan.razorpayPlanId === razorpayPlanId,
    ) ?? null
  );
}

export function hasUnlimited(limit) {
  return limit === -1;
}
