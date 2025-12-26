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
  const resumeText = (pdfData.text || "").trim();

  if (resumeText.length < 50) {
    throw new Error("Resume text is empty or unreadable. Please upload a searchable PDF.");
  }

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `
=== RESUME TO ANALYZE ===
${resumeText}

=== JOB DESCRIPTION REQUIREMENTS ===
${jobDescription}

CRITICAL INSTRUCTIONS: 
- Apply ULTRA-STRICT evaluation standards
- Start match score at 0, add points ONLY when proven with evidence
- Deduct points for missing critical skills (-15 each)
- Flag ALL red flags: keyword stuffing, vague claims, missing metrics, outdated skills
- Be BRUTALLY HONEST in feedback - candidates need truth
- Use weighted scoring algorithm precisely
- If missing 2+ critical skills, score MUST be <60%
- Most resumes are 60-75% matches, NOT 85%+
- Provide specific evidence for every claim
          `,
        },
      ],
      temperature: 0.05,
      top_p: 0.85,
      max_tokens: 4096,
    });
  } finally {
    // Clean up file safely even if upstream fails
    try {
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    } catch (e) {
      console.warn("Failed to delete resume file:", pdfPath, e.message);
    }
  }

  const text = completion.choices[0].message.content;

  // Robust JSON extraction and parsing
  const cleaned = text
    .replace(/```json|\```/g, "")
    .replace(/^[^{]*/, "") // Remove text before first {
    .replace(/[^}]*$/, "") // Remove text after last }
    .trim();

  try {
    const ai = JSON.parse(cleaned);

    // Validate and normalize all fields with strict type checking
    const critical = Array.isArray(ai.criticalSkillGaps) ? ai.criticalSkillGaps.filter(s => s) : [];
    const important = Array.isArray(ai.importantSkillGaps) ? ai.importantSkillGaps.filter(s => s) : [];
    const reported = Array.isArray(ai.missingSkills) ? ai.missingSkills.filter(s => s) : [];

    const missingSkills = Array.from(new Set([...reported, ...critical, ...important].flat().filter(Boolean)));

    // Score validation
    let score = Number(ai.matchScore) || Number(ai.score) || 0;
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    // Combine all feedback sources
    const parts = [
      ai.selectionLikelihood?.reason,
      ai.resumeVsJDAnalysis,
      ai.overallFeedback,
      ai.finalVerdict
    ].filter(Boolean);

    const overallFeedback = parts.join(" — ") || "Analysis complete.";

    return {
      matchScore: score,
      missingSkills,
      overallFeedback,
      resumeText,
      jobDescription,
      _raw: ai
    };
  } catch (err) {
    console.error("⚠️ Failed to parse AI JSON:", err.message);
    // Return fallback structure on parse error
    return {
      matchScore: 0,
      missingSkills: [],
      overallFeedback: "Unable to parse AI response. Please try again.",
      resumeText: "",
      jobDescription: "",
      _raw: { rawOutput: text, parseError: err.message }
    };
  }
}

module.exports = { analyzeResume };
