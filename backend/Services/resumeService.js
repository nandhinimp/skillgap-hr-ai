const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const promptPath = path.join(__dirname, "../prompts/resume.prompt.txt");
const systemPrompt = fs.readFileSync(promptPath, "utf8");

async function analyzeResume(pdfPath, jobDescription) {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfData = await pdfParse(pdfBuffer);

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `
Resume:
${pdfData.text}

Job Description:
${jobDescription}
        `,
      },
    ],
    temperature: 0.2,
  });

  fs.unlinkSync(pdfPath);

  const text = completion.choices[0].message.content;

  // 🔐 try to coerce into valid JSON and fall back gracefully
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("⚠️ Failed to parse AI JSON:", err.message);
    return { rawOutput: text, error: "Invalid AI JSON output" };
  }
}

module.exports = { analyzeResume };
