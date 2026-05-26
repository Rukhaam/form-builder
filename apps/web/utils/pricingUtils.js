export const billingOptions = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

export const planCards = [
  {
    tier: 'starter',
    name: 'Starter',
    description: 'For trying the builder and publishing a few lightweight forms.',
    featured: false,
    prices: {
      monthly: { id: 'FREE', price: 'INR 0', cadence: 'forever', cta: 'Start free' },
      yearly: { id: 'FREE', price: 'INR 0', cadence: 'forever', cta: 'Start free' },
    },
    features: [
      '3 published forms',
      '100 responses per month',
      'Basic analytics',
      'Public form sharing',
      'Draft and publish workflow',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    description: 'For creators who need unlimited forms and a higher response ceiling.',
    featured: true,
    prices: {
      monthly: { id: 'PRO_MONTHLY', price: 'INR 900', cadence: 'per month', cta: 'Choose Pro' },
      yearly: { id: 'PRO_YEARLY', price: 'INR 9,000', cadence: 'per year', cta: 'Choose Pro yearly', note: 'Save INR 1,800' },
    },
    features: [
      'Unlimited forms',
      '10,000 responses per month',
      'Advanced analytics',
      'Custom visibility controls',
      'Priority form loading',
    ],
  },
  {
    tier: 'business',
    name: 'Business',
    description: 'For teams running campaigns, client intakes, and higher-volume workflows.',
    featured: false,
    prices: {
      monthly: { id: 'BUSINESS_MONTHLY', price: 'INR 2,500', cadence: 'per month', cta: 'Choose Business' },
      yearly: { id: 'BUSINESS_YEARLY', price: 'INR 25,000', cadence: 'per year', cta: 'Choose Business yearly', note: 'Save INR 5,000' },
    },
    features: [
      'Everything in Pro',
      '50,000 responses per month',
      'Team-ready workloads',
      'Export-ready response views',
      'Priority support',
    ],
  },
];

export const comparisonRows = [
  { label: 'Published forms', starter: '3', pro: 'Unlimited', business: 'Unlimited' },
  { label: 'Monthly responses', starter: '100', pro: '10,000', business: '50,000' },
  { label: 'Analytics dashboard', starter: 'Basic', pro: 'Advanced', business: 'Advanced' },
  { label: 'Public form sharing', starter: 'Included', pro: 'Included', business: 'Included' },
  { label: 'Team workload fit', starter: 'Solo', pro: 'Creator', business: 'Team' },
];

export const faqs = [
  {
    question: 'Are these Razorpay subscriptions?',
    answer: 'Yes. Paid plans use Razorpay subscription plan IDs and are verified on the server before activation.',
  },
  {
    question: 'Can I use Starter without a card?',
    answer: 'Yes. Starter is free and does not open checkout.',
  },
  {
    question: 'Do respondents need accounts?',
    answer: 'No. Visitors can submit public forms without signing in.',
  },
  {
    question: 'What happens after payment?',
    answer: 'The server verifies Razorpay signature and activates the matching plan for your account.',
  },
];

export function getCurrentPlanLabel(planId) {
  if (!planId || planId === 'FREE') return 'Starter';
  if (planId.startsWith('PRO')) return 'Pro';
  if (planId.startsWith('BUSINESS') || planId === 'STUDIO') return 'Business';
  return 'Starter';
}
