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

  return {
    title: form.title,
    description: form.description,
    openGraph: {
      title: form.title,
      description: form.description,
      type: 'website',
      url: `${baseUrl}/forms/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: form.title,
      description: form.description,
    },
  };
}

export default function Page() {
  return <PublicFormResponsePage />;
}
