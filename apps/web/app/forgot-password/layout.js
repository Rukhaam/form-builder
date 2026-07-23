export const metadata = {
  title: 'Forgot Password — Reset Your Account',
  description:
    'Reset your FormBuilder account password securely. Enter your email to receive a one-time reset code and regain access to your forms and data.',
  keywords: [
    'FormBuilder forgot password',
    'reset password',
    'account recovery',
    'password reset form builder',
  ],
  openGraph: {
    title: 'Forgot Password — FormBuilder',
    description:
      'Reset your FormBuilder account password securely with a one-time code.',
    url: 'https://formbuilder.summitdigital.in/forgot-password',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Forgot Password — FormBuilder',
    description:
      'Reset your FormBuilder account password securely.',
  },
  alternates: {
    canonical: 'https://formbuilder.summitdigital.in/forgot-password',
  },
};

export default function ForgotPasswordLayout({ children }) {
  return children;
}
