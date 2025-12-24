const fs = require("fs");
const groq = require("/groqClient");

const prompt = fs.readFileSync(
  __dirname + "/../prompts/resume.prompt.txt",
  "utf8"
);

module.exports = async function analyzeResume(resumeText, jobDescription) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.2,
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`
      }
    ]
  });

  let text = completion.choices[0].message.content;

  // 🔐 Clean markdown if AI misbehaves
  text = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(text);
  } catch {
    // HARD fallback (never break frontend)
    return {
      matchScore: 0,
      missingSkills: [],
      overallFeedback: text
    };
  }
};
