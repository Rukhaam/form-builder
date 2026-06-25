import { db } from "@repo/database";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = "https://formbuilder.summitdigital.in";

  // Static routes
  const staticRoutes = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
  ];

  // Fetch published and public forms
  const forms = await db.query.forms.findMany({
    where: (forms, { eq, and }) =>
      and(eq(forms.status, "PUBLISHED"), eq(forms.visibility, "PUBLIC")),
    columns: {
      slug: true,
      createdAt: true, // No updatedAt in schema, using createdAt
    },
  });

  const dynamicRoutes = forms.map((form) => ({
    url: `${baseUrl}/forms/${form.slug}`,
    lastModified: form.createdAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
