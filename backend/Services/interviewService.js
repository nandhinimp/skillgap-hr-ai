const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const promptPath = path.join(__dirname, "../prompts/prompt-interview.txt");
const systemPrompt = fs.readFileSync(promptPath, "utf8");

async function generateInterviewQuestions(missingSkills) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Missing Skills:\n${(missingSkills || []).join("\n")}`,
      },
    ],
  });

  const text = completion.choices[0].message.content;
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    const json = JSON.parse(cleaned);
    return json;
  } catch (e) {
    return { rawOutput: text };
  }
}

module.exports = { generateInterviewQuestions };
