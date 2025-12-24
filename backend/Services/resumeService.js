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
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    const ai = JSON.parse(cleaned);

    const critical = Array.isArray(ai.criticalSkillGaps) ? ai.criticalSkillGaps : [];
    const important = Array.isArray(ai.importantSkillGaps) ? ai.importantSkillGaps : [];
    const reportedMissing = Array.isArray(ai.missingSkills) ? ai.missingSkills : [];

    const missingSkills = Array.from(new Set([...reportedMissing, ...critical, ...important].flat().filter(Boolean)));

    const parts = [ai.selectionLikelihood?.reason, ai.resumeVsJDAnalysis, ai.finalVerdict].filter(Boolean);
    const overallFeedback = ai.overallFeedback || parts.join(" — ");

    return {
      matchScore: ai.matchScore ?? ai.score ?? 0,
      missingSkills,
      overallFeedback,
      _raw: ai,
    };
  } catch (err) {
    console.error("⚠️ Failed to parse AI JSON:", err.message);
    return { rawOutput: text, error: "Invalid AI JSON output" };
  }
}

module.exports = { analyzeResume };
