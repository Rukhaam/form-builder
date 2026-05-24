import { db, forms, formFields } from './index.js';

async function seed() {
  const [userForm] = await db.select().from(forms).limit(1);
  const userId = userForm ? userForm.userId : 'system';

  const [t1] = await db.insert(forms).values({
    userId,
    title: 'Customer Feedback',
    description: 'Template for customer feedback',
    slug: 'customer-feedback-tmpl-' + Date.now(),
    status: 'PUBLISHED',
    isTemplate: true,
    category: 'Feedback',
    theme: 'light'
  }).returning();

  await db.insert(formFields).values({ formId: t1.id, type: 'long_text', label: 'How can we improve?', order: 0 });

  const [t2] = await db.insert(forms).values({
    userId,
    title: 'Job Application',
    description: 'Template for job applications',
    slug: 'job-app-tmpl-' + Date.now(),
    status: 'PUBLISHED',
    isTemplate: true,
    category: 'HR & Recruiting',
    theme: 'light'
  }).returning();

  await db.insert(formFields).values({ formId: t2.id, type: 'short_text', label: 'Full Name', order: 0 });

  console.log('Seeded templates:', t1.id, t2.id);
  process.exit(0);
}

seed().catch(console.error);