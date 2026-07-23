import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Refund & Cancellation Policy',
  description:
    "Review FormBuilder's refund and subscription cancellation policy. Learn about billing, refund eligibility, and how to contact our support team for account assistance.",
  keywords: [
    'FormBuilder refund policy',
    'subscription cancellation',
    'billing support',
    'refund eligibility',
    'SaaS refund',
    'cancel subscription',
  ],
  openGraph: {
    title: 'Refund & Cancellation Policy — FormBuilder',
    description:
      "Review FormBuilder's refund and subscription cancellation policy for billing and account assistance.",
    url: 'https://formbuilder.summitdigital.in/refund-policy',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Refund & Cancellation Policy — FormBuilder',
    description:
      "Review FormBuilder's refund and subscription cancellation policy.",
  },
  alternates: {
    canonical: 'https://formbuilder.summitdigital.in/refund-policy',
  },
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-32 md:py-40">
        <h1 className="mb-12 text-4xl font-medium tracking-tight text-slate-950 md:text-5xl">
          Refund Policy
        </h1>
        
        <div className="space-y-10 text-base leading-relaxed text-slate-600 md:text-lg">
          <p>
            Thank you for choosing FormBuilder. We strive to provide the best possible experience for creating and managing your forms. Please read our policy regarding subscriptions, cancellations, and refunds carefully.
          </p>
          
          <div>
            <h2 className="mb-4 text-2xl font-medium tracking-tight text-slate-950">Subscription Cancellations</h2>
            <p>
              Please note that <strong>users cannot cancel their active subscriptions directly from their dashboard</strong>. Subscriptions are billed on a recurring basis. To request a cancellation, prevent future billing, or request any modifications to your billing plan, you must contact our support team.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-medium tracking-tight text-slate-950">Refund Eligibility</h2>
            <p>
              Because FormBuilder provides a digital service with immediate access to our platform and premium features, all payments are generally considered final and non-refundable. Refunds are evaluated strictly on a case-by-case basis under exceptional circumstances, such as demonstrable billing errors on our end.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-medium tracking-tight text-slate-950">Need Support?</h2>
            <p>
              If you wish to cancel your subscription, request a refund due to a billing error, or require any other account-related assistance, please contact the site administrator at:
            </p>
            <p className="mt-4">
              <a href="mailto:admin@formbuilder.com" className="font-medium text-violet-600 hover:text-violet-700 underline underline-offset-4">
                admin@formbuilder.com
              </a>
            </p>
            <p className="mt-4">
              Our team will review your request and get back to you within 2-3 business days. We appreciate your patience and understanding.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
