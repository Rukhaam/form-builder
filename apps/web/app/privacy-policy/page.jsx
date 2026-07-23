import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';

export const metadata = {
  title: 'Privacy Policy',
  description:
    "Read FormBuilder's privacy policy to understand how we collect, use, and protect your personal data and form responses. Your privacy and data security are our top priorities.",
  keywords: [
    'FormBuilder privacy policy',
    'data protection',
    'form data privacy',
    'user data security',
    'GDPR compliance',
    'privacy SaaS',
  ],
  openGraph: {
    title: 'Privacy Policy — FormBuilder',
    description:
      'Understand how FormBuilder handles your data. Read our privacy and data protection policy.',
    url: 'https://formbuilder.summitdigital.in/privacy-policy',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy — FormBuilder',
    description:
      'Understand how FormBuilder handles your data. Read our privacy and data protection policy.',
  },
  alternates: {
    canonical: 'https://formbuilder.summitdigital.in/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-32 md:py-40">
        <h1 className="mb-4 text-4xl font-medium tracking-tight text-slate-950 md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mb-12 text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        
        <div className="space-y-10 text-base leading-relaxed text-slate-600 md:text-lg">
          <p>
            At FormBuilder, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our software-as-a-service platform. By using the Service, you agree to the collection and use of information in accordance with this Privacy Policy.
          </p>

          <div>
            <h2 className="mb-4 text-2xl font-medium tracking-tight text-slate-950">1. Information We Collect</h2>
            <p className="mb-3">
              <strong>Personal Data:</strong> We may collect personal identification information such as your email address, name, and billing details when you register for an account or subscribe to our paid plans.
            </p>
            <p>
              <strong>Form Data:</strong> Information you collect through the forms created on our platform is stored securely on our servers. You retain all rights to this data, and we do not use your form respondents' data for our own marketing purposes or sell it to third parties.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-medium tracking-tight text-slate-950">2. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-inside list-disc space-y-2 pl-4">
              <li>Provide, operate, and maintain our platform.</li>
              <li>Process transactions and send related billing information.</li>
              <li>Send you technical notices, updates, and security alerts.</li>
              <li>Respond to your comments, questions, and customer service requests.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-medium tracking-tight text-slate-950">3. Data Security</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-medium tracking-tight text-slate-950">4. Sharing of Information</h2>
            <p>
              We do not sell or rent your personal information to third parties. We may share information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf, such as payment processors, data analysis, and hosting services. We require all such third parties to maintain the confidentiality of your information.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-medium tracking-tight text-slate-950">5. Your Rights</h2>
            <p>
              Depending on your location, you may have the right to request access to the personal data we hold about you, to request that your personal data be corrected or deleted, and to withdraw your consent for data processing. You can exercise these rights by contacting us directly.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-medium tracking-tight text-slate-950">6. Contact Us</h2>
            <p>
              If you have any questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-4">
              <a href="mailto:admin@formbuilder.com" className="font-medium text-violet-600 hover:text-violet-700 underline underline-offset-4">
                admin@formbuilder.com
              </a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
