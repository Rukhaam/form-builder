import { db } from '@repo/database';
import PublicFormResponsePage from './FormClient';

export async function generateMetadata({ params }) {
  const { slug } = params;
  const baseUrl = 'https://formbuilder.summitdigital.in';
  
  const form = await db.query.forms.findFirst({
    where: (forms, { eq }) => eq(forms.slug, slug),
    columns: {
      title: true,
      description: true,
      visibility: true,
    }
  });

  if (!form || form.visibility === 'UNLISTED') {
    return {
      title: form?.title || 'Form Not Found',
      description: form?.description || 'This form is unavailable.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const pageTitle = `${form.title} — Fill Out This Form`;
  const pageDescription = form.description || `Submit your response to "${form.title}" on FormBuilder. Fast, secure, and easy to complete.`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      form.title,
      'online form',
      'submit form',
      'public form',
      'form response',
      'FormBuilder',
    ],
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: 'website',
      url: `${baseUrl}/forms/${slug}`,
      siteName: 'FormBuilder',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
    },
    alternates: {
      canonical: `${baseUrl}/forms/${slug}`,
    },
  };
}

export default function Page() {
  return <PublicFormResponsePage />;
}
