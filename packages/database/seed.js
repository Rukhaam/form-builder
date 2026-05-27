import { eq } from 'drizzle-orm';
import { db, forms, formFields, users } from './index.js';

async function getSeedUserId() {
  const seedEmail = 'templates@formbuilder.local';

  await db
    .insert(users)
    .values({
      email: seedEmail,
      isEmailVerified: true,
    })
    .onConflictDoNothing({ target: users.email });

  const [seedUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, seedEmail))
    .limit(1);

  if (!seedUser) {
    throw new Error(`Unable to create or find seed user: ${seedEmail}`);
  }

  return seedUser.id;
}

async function seed() {
  const userId = await getSeedUserId();
  const timestamp = Date.now();

  const [t1] = await db.insert(forms).values({
    userId,
    title: 'Customer Feedback',
    description: 'Template for customer feedback',
    slug: `customer-feedback-tmpl-${timestamp}`,
    status: 'PUBLISHED',
    isTemplate: true,
    category: 'Feedback',
    theme: 'light',
  }).returning();

  await db.insert(formFields).values({
    formId: t1.id,
    type: 'long_text',
    label: 'How can we improve?',
    order: 0,
  });

  const [t2] = await db.insert(forms).values({
    userId,
    title: 'Job Application',
    description: 'Template for job applications',
    slug: `job-app-tmpl-${timestamp}`,
    status: 'PUBLISHED',
    isTemplate: true,
    category: 'HR & Recruiting',
    theme: 'light',
  }).returning();

  await db.insert(formFields).values({
    formId: t2.id,
    type: 'short_text',
    label: 'Full Name',
    order: 0,
  });

  console.log('Seeded templates:', t1.id, t2.id);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
