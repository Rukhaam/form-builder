import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const FIELD_TYPES = [
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
];

const generatedFieldSchema = z.object({
  type: z.enum(FIELD_TYPES),
  label: z.string().trim().min(1).max(120),
  required: z.boolean().default(false),
  options: z.array(z.string().trim().min(1).max(80)).max(10).default([]),
});

export const generatedFormSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).default(""),
  fields: z.array(generatedFieldSchema).min(1).max(12),
});

const SYSTEM_INSTRUCTION = `You turn a user's requirements into a practical online form.
Use the conversation only to understand the user's current need. Return JSON only, with this exact shape:
{
  "title": "short form title",
  "description": "one concise sentence explaining the form",
  "fields": [
    { "type": "short_text | long_text | email | number | single_select | multi_select | checkbox", "label": "Question label", "required": true, "options": ["Only for select or checkbox fields"] }
  ]
}
Create 3–12 focused fields. Use email only when an email address is needed. Never request passwords, payment card data, government IDs, or other highly sensitive data. Keep option labels short and useful.`;

function parseModelJson(text) {
  const withoutFence = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  return JSON.parse(withoutFence);
}

export async function generateFormFromPrompt({ history, prompt }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("The form assistant is not configured. Add GEMINI_API_KEY to enable it.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_FORM_ASSISTANT_MODEL || "gemini-2.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.25,
      maxOutputTokens: 1800,
    },
  });

  const recentHistory = history
    .slice(-12)
    .map((message) => `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`)
    .join("\n");

  const result = await model.generateContent(
    `${recentHistory ? `Conversation so far:\n${recentHistory}\n\n` : ""}Latest request: ${prompt}`,
  );
  const data = parseModelJson(result.response.text());
  const parsed = generatedFormSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("The assistant returned an invalid form draft. Please try again.");
  }

  return parsed.data;
}
