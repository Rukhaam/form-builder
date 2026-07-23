export const metadata = {
  title: 'Public Forms — Hall of Fame',
  description:
    'Browse and answer the top-rated published forms from the FormBuilder community. No account needed — just pick a form and submit your response.',
  keywords: [
    'public forms',
    'online forms',
    'community forms',
    'top rated forms',
    'submit form online',
    'fill out forms',
    'form gallery',
    'FormBuilder public gallery',
  ],
  openGraph: {
    title: 'Public Forms — Hall of Fame',
    description:
      'Browse and answer top-rated published forms from the FormBuilder community. No account needed.',
    url: 'https://formbuilder.summitdigital.in/forms',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Public Forms — FormBuilder Hall of Fame',
    description:
      'Browse and answer top-rated published forms. No account needed.',
  },
  alternates: {
    canonical: 'https://formbuilder.summitdigital.in/forms',
  },
};

export default function FormsLayout({ children }) {
  return children;
}
