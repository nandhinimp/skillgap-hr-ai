const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const promptPath = path.join(__dirname, "../prompts/prompt-evaluation.txt");
const systemPrompt = fs.readFileSync(promptPath, "utf8");

async function evaluateAnswer(question, answer) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Question:\n${question}\n\nCandidate Answer:\n${answer}`,
      },
    ],
  });

  const text = completion.choices[0].message.content;
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return { rawOutput: text };
  }
}

module.exports = { evaluateAnswer };
