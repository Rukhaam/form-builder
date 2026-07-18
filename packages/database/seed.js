import { eq } from "drizzle-orm";
import { db, forms, formFields, users } from "./index.js";

async function getSeedUserId() {
  const seedEmail = "templates@formbuilder.local";

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

// ── Template definitions ─────────────────────────────────────────────────
const TEMPLATES = [
  // ─── Feedback ──────────────────────────────────────────────────────────
  {
    title: "Customer Feedback",
    description:
      "Collect actionable feedback from your customers to improve products and services.",
    slug: "customer-feedback-tmpl",
    category: "Feedback",
    coverImageUrl: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&h=500&fit=crop&q=80",
    theme: "light",
    fields: [
      { type: "short_text", label: "Your Name", required: true },
      { type: "email", label: "Email Address", required: true },
      {
        type: "single_select",
        label: "How would you rate your experience?",
        options: ["Excellent", "Good", "Average", "Poor", "Very Poor"],
      },
      { type: "long_text", label: "What did you enjoy most?" },
      { type: "long_text", label: "How can we improve?" },
      { type: "checkbox", label: "I agree to be contacted for follow-up" },
    ],
  },
  {
    title: "Product Review",
    description:
      "Let your users rate and review your product with structured feedback.",
    slug: "product-review-tmpl",
    category: "Feedback",
    coverImageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop&q=80",
    theme: "dark",
    fields: [
      { type: "short_text", label: "Your Name" },
      { type: "email", label: "Email" },
      {
        type: "single_select",
        label: "Overall Rating",
        options: ["★★★★★ (5)", "★★★★ (4)", "★★★ (3)", "★★ (2)", "★ (1)"],
      },
      { type: "long_text", label: "Write your review" },
      {
        type: "single_select",
        label: "Would you recommend this product?",
        options: ["Yes", "No", "Maybe"],
      },
    ],
  },
  {
    title: "Website Feedback",
    description:
      "Understand how visitors perceive your website and uncover UX issues.",
    slug: "website-feedback-tmpl",
    category: "Feedback",
    coverImageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&q=80",
    theme: "light",
    fields: [
      {
        type: "single_select",
        label: "How easy was it to find what you were looking for?",
        options: [
          "Very easy",
          "Easy",
          "Neutral",
          "Difficult",
          "Very difficult",
        ],
      },
      {
        type: "single_select",
        label: "How would you rate the website design?",
        options: ["Excellent", "Good", "Average", "Poor"],
      },
      { type: "long_text", label: "What would you change about the website?" },
      { type: "checkbox", label: "I would visit this website again" },
    ],
  },

  // ─── HR & Recruiting ──────────────────────────────────────────────────
  {
    title: "Job Application",
    description:
      "A comprehensive job application form with all the essentials for screening candidates.",
    slug: "job-application-tmpl",
    category: "HR & Recruiting",
    coverImageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=500&fit=crop&q=80",
    theme: "light",
    fields: [
      { type: "short_text", label: "Full Name", required: true },
      { type: "email", label: "Email Address", required: true },
      { type: "short_text", label: "Phone Number", required: true },
      {
        type: "single_select",
        label: "Position Applied For",
        options: [
          "Software Engineer",
          "Product Manager",
          "Designer",
          "Marketing",
          "Sales",
          "Other",
        ],
      },
      { type: "long_text", label: "Cover Letter / Why are you interested?" },
      { type: "short_text", label: "LinkedIn Profile URL" },
    ],
  },
  {
    title: "Employee Satisfaction Survey",
    description:
      "Gauge team morale and identify areas for workplace improvement.",
    slug: "employee-satisfaction-tmpl",
    category: "HR & Recruiting",
    coverImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop&q=80",
    theme: "dark",
    fields: [
      {
        type: "single_select",
        label: "Department",
        options: [
          "Engineering",
          "Design",
          "Marketing",
          "Sales",
          "Operations",
          "Finance",
          "HR",
        ],
      },
      {
        type: "single_select",
        label: "How satisfied are you with your role?",
        options: [
          "Very satisfied",
          "Satisfied",
          "Neutral",
          "Dissatisfied",
          "Very dissatisfied",
        ],
      },
      {
        type: "single_select",
        label: "How would you rate work-life balance?",
        options: ["Excellent", "Good", "Fair", "Poor"],
      },
      {
        type: "multi_select",
        label: "What benefits matter most to you?",
        options: [
          "Health insurance",
          "Remote work",
          "Learning budget",
          "Gym membership",
          "Stock options",
          "Flexible hours",
        ],
      },
      { type: "long_text", label: "Any additional comments or suggestions?" },
    ],
  },

  // ─── Education ─────────────────────────────────────────────────────────
  {
    title: "Course Evaluation",
    description:
      "Collect student feedback on course content, instructor, and overall experience.",
    slug: "course-evaluation-tmpl",
    category: "Education",
    coverImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&h=500&fit=crop&q=80",
    theme: "light",
    fields: [
      { type: "short_text", label: "Course Name", required: true },
      { type: "short_text", label: "Instructor Name" },
      {
        type: "single_select",
        label: "Overall Course Rating",
        options: ["Excellent", "Very Good", "Good", "Fair", "Poor"],
      },
      {
        type: "single_select",
        label: "Difficulty Level",
        options: ["Too Easy", "Just Right", "Too Hard"],
      },
      {
        type: "long_text",
        label: "What did you learn that was most valuable?",
      },
      { type: "long_text", label: "Suggestions for improvement" },
    ],
  },
  {
    title: "Student Registration",
    description:
      "Streamline student enrollment and gather essential registration details.",
    slug: "student-registration-tmpl",
    category: "Education",
    coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop&q=80",
    theme: "light",
    fields: [
      { type: "short_text", label: "Full Name", required: true },
      { type: "email", label: "Student Email", required: true },
      { type: "short_text", label: "Student ID" },
      {
        type: "single_select",
        label: "Year of Study",
        options: [
          "1st Year",
          "2nd Year",
          "3rd Year",
          "4th Year",
          "Postgraduate",
        ],
      },
      {
        type: "multi_select",
        label: "Courses to Enroll",
        options: [
          "Mathematics",
          "Physics",
          "Computer Science",
          "English",
          "History",
          "Art",
        ],
      },
      {
        type: "checkbox",
        label: "I accept the terms and conditions",
        required: true,
      },
    ],
  },

  // ─── Events ────────────────────────────────────────────────────────────
  {
    title: "Event Registration",
    description:
      "A polished registration form for conferences, meetups, and workshops.",
    slug: "event-registration-tmpl",
    category: "Events",
    coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop&q=80",
    theme: "dark",
    fields: [
      { type: "short_text", label: "Full Name", required: true },
      { type: "email", label: "Email Address", required: true },
      { type: "short_text", label: "Company / Organization" },
      {
        type: "single_select",
        label: "Ticket Type",
        options: ["General Admission", "VIP", "Student", "Speaker"],
      },
      {
        type: "multi_select",
        label: "Sessions you plan to attend",
        options: [
          "Keynote",
          "Workshop A",
          "Workshop B",
          "Panel Discussion",
          "Networking Lunch",
        ],
      },
      { type: "checkbox", label: "I need dietary accommodations" },
    ],
  },
  {
    title: "Event Feedback",
    description:
      "Post-event survey to measure attendee satisfaction and gather insights.",
    slug: "event-feedback-tmpl",
    category: "Events",
    coverImageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=500&fit=crop&q=80",
    theme: "light",
    fields: [
      {
        type: "single_select",
        label: "Overall event rating",
        options: ["Outstanding", "Very Good", "Good", "Fair", "Poor"],
      },
      {
        type: "single_select",
        label: "How likely are you to attend again?",
        options: ["Definitely", "Probably", "Not sure", "Unlikely"],
      },
      { type: "long_text", label: "What was the highlight of the event?" },
      { type: "long_text", label: "How could the event be improved?" },
    ],
  },

  // ─── Marketing ─────────────────────────────────────────────────────────
  {
    title: "Newsletter Signup",
    description:
      "A clean, focused form to grow your email list with opt-in consent.",
    slug: "newsletter-signup-tmpl",
    category: "Marketing",
    coverImageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&h=500&fit=crop&q=80",
    theme: "dark",
    fields: [
      { type: "short_text", label: "First Name", required: true },
      { type: "email", label: "Email Address", required: true },
      {
        type: "multi_select",
        label: "Topics you're interested in",
        options: [
          "Product Updates",
          "Industry News",
          "Tips & Tutorials",
          "Case Studies",
          "Company News",
        ],
      },
      {
        type: "checkbox",
        label: "I agree to receive marketing emails",
        required: true,
      },
    ],
  },
  {
    title: "Lead Generation",
    description:
      "Capture qualified leads with a conversion-optimized intake form.",
    slug: "lead-generation-tmpl",
    category: "Marketing",
    coverImageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&q=80",
    theme: "light",
    fields: [
      { type: "short_text", label: "Full Name", required: true },
      { type: "email", label: "Work Email", required: true },
      { type: "short_text", label: "Company Name" },
      {
        type: "single_select",
        label: "Company Size",
        options: ["1–10", "11–50", "51–200", "201–1000", "1000+"],
      },
      {
        type: "single_select",
        label: "Budget Range",
        options: ["Under $1K", "$1K–$5K", "$5K–$20K", "$20K+"],
      },
      { type: "long_text", label: "Tell us about your project" },
    ],
  },

  // ─── Customer Support ──────────────────────────────────────────────────
  {
    title: "Bug Report",
    description:
      "Help users report issues with structured steps-to-reproduce and priority levels.",
    slug: "bug-report-tmpl",
    category: "Customer Support",
    coverImageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=500&fit=crop&q=80",
    theme: "dark",
    fields: [
      { type: "short_text", label: "Bug Title", required: true },
      { type: "email", label: "Your Email", required: true },
      {
        type: "single_select",
        label: "Priority",
        options: ["Critical", "High", "Medium", "Low"],
      },
      {
        type: "single_select",
        label: "Browser / Platform",
        options: [
          "Chrome",
          "Firefox",
          "Safari",
          "Edge",
          "Mobile iOS",
          "Mobile Android",
          "Other",
        ],
      },
      { type: "long_text", label: "Steps to Reproduce", required: true },
      { type: "long_text", label: "Expected vs Actual Behavior" },
    ],
  },
  {
    title: "Contact Us",
    description: "A simple, professional contact form for general inquiries.",
    slug: "contact-us-tmpl",
    category: "Customer Support",
    coverImageUrl: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&h=500&fit=crop&q=80",
    theme: "light",
    fields: [
      { type: "short_text", label: "Full Name", required: true },
      { type: "email", label: "Email Address", required: true },
      {
        type: "single_select",
        label: "Subject",
        options: [
          "General Inquiry",
          "Partnership",
          "Billing",
          "Technical Support",
          "Other",
        ],
      },
      { type: "long_text", label: "Your Message", required: true },
    ],
  },

  // ─── Healthcare ────────────────────────────────────────────────────────
  {
    title: "Patient Intake Form",
    description:
      "Streamline patient onboarding with a thorough medical intake form.",
    slug: "patient-intake-tmpl",
    category: "Healthcare",
    coverImageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop&q=80",
    theme: "light",
    fields: [
      { type: "short_text", label: "Full Name", required: true },
      { type: "email", label: "Email", required: true },
      { type: "short_text", label: "Phone Number", required: true },
      { type: "number", label: "Age", required: true },
      {
        type: "single_select",
        label: "Gender",
        options: ["Male", "Female", "Non-binary", "Prefer not to say"],
      },
      {
        type: "multi_select",
        label: "Existing Conditions",
        options: [
          "Diabetes",
          "Hypertension",
          "Asthma",
          "Heart Disease",
          "None",
        ],
      },
    ],
  },
];

// ── Seed runner ──────────────────────────────────────────────────────────
async function seed() {
  const userId = await getSeedUserId();
  const timestamp = Date.now();
  const seeded = [];

  for (const tmpl of TEMPLATES) {
    const slug = `${tmpl.slug}-${timestamp}`;

    const [form] = await db
      .insert(forms)
      .values({
        userId,
        title: tmpl.title,
        description: tmpl.description,
        slug,
        status: "PUBLISHED",
        isTemplate: true,
        category: tmpl.category,
        coverImageUrl: tmpl.coverImageUrl || null,
        theme: tmpl.theme,
      })
      .onConflictDoNothing({ target: forms.slug })
      .returning();

    if (!form) {
      console.log(`  ⏩ Skipped (slug exists): ${slug}`);
      continue;
    }

    const fieldValues = tmpl.fields.map((f, i) => ({
      formId: form.id,
      type: f.type,
      label: f.label,
      required: f.required ?? false,
      order: i,
      options: f.options ? JSON.stringify(f.options) : null,
    }));

    await db.insert(formFields).values(fieldValues);

    seeded.push(form.id);
    console.log(`  ✅ ${tmpl.title} (${tmpl.category})`);
  }

  console.log(`\nSeeded ${seeded.length} templates.`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
