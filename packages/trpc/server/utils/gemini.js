import "./loadEnv.js";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: "A concise 2-3 sentence summary of the text responses",
    },
    themes: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Array of 3-7 common themes extracted from responses",
    },
    sentiment: {
      type: SchemaType.OBJECT,
      properties: {
        positive: { type: SchemaType.NUMBER },
        neutral: { type: SchemaType.NUMBER },
        negative: { type: SchemaType.NUMBER },
      },
      required: ["positive", "neutral", "negative"],
      description: "Sentiment breakdown as percentages that sum to 100",
    },
  },
  required: ["summary", "themes", "sentiment"],
};

/**
 * Analyzes aggregated text responses using Gemini.
 * @param {{ fieldLabel: string, responses: string[] }[]} fieldResponses
 * @returns {Promise<{ summary: string, themes: string[], sentiment: { positive: number, neutral: number, negative: number } }>}
 */
export async function analyzeTextResponses(fieldResponses) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.3,
    },
  });

  // Build the prompt with field-grouped responses
  const sections = fieldResponses.map(({ fieldLabel, responses }) => {
    const truncatedResponses = responses.slice(0, 200);
    const listing = truncatedResponses
      .map((r, i) => `  ${i + 1}. "${r}"`)
      .join("\n");
    return `## Field: "${fieldLabel}" (${truncatedResponses.length} responses)\n${listing}`;
  });

  const prompt = `You are an expert data analyst. Analyze the following form text responses and provide:

1. **Summary**: A concise 2-3 sentence overview of what respondents are saying.
2. **Themes**: Extract 3-7 common themes or topics mentioned across responses.
3. **Sentiment**: Estimate the percentage of responses that are positive, neutral, and negative. The three values must sum to 100.

Here are the responses grouped by field:

${sections.join("\n\n")}

Provide your analysis in the required JSON format.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const parsed = JSON.parse(text);

  // Ensure sentiment sums to 100
  const { positive = 0, neutral = 0, negative = 0 } = parsed.sentiment || {};
  const total = positive + neutral + negative;
  if (total > 0 && total !== 100) {
    const scale = 100 / total;
    parsed.sentiment = {
      positive: Math.round(positive * scale),
      neutral: Math.round(neutral * scale),
      negative:
        100 - Math.round(positive * scale) - Math.round(neutral * scale),
    };
  }

  return parsed;
}
