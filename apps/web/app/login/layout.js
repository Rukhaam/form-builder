export const metadata = {
  title: 'Sign In to Your Account',
  description:
    'Log in to your FormBuilder account to manage your forms, view analytics, and collect responses. Secure sign-in with email or Google OAuth.',
  keywords: [
    'FormBuilder login',
    'sign in form builder',
    'form builder account',
    'secure login',
    'Google OAuth login',
  ],
  openGraph: {
    title: 'Sign In — FormBuilder',
    description:
      'Log in to your FormBuilder account to manage forms, view analytics, and collect responses.',
    url: 'https://formbuilder.summitdigital.in/login',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sign In — FormBuilder',
    description:
      'Log in to your FormBuilder account to manage forms and view analytics.',
  },
  alternates: {
    canonical: 'https://formbuilder.summitdigital.in/login',
  },
};

export default function LoginLayout({ children }) {
  return children;
}
