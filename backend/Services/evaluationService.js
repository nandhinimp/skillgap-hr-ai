const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const promptPath = path.join(__dirname, "../prompts/prompt-evaluation.txt");
const systemPrompt = fs.readFileSync(promptPath, "utf8");

async function evaluateAnswer(question, answer) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    top_p: 0.95,
    max_tokens: 2048,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Interview Question:\n${question}\n\nCandidate's Answer:\n${answer}\n\nProvide detailed, actionable evaluation with specific examples of what's missing.`,
      },
    ],
  });

  const text = completion.choices[0].message.content;
  
  // Robust JSON extraction
  const cleaned = text
    .replace(/```json|\```/g, "")
    .replace(/^[^{]*/, "")
    .replace(/[^}]*$/, "")
    .trim();

  try {
    const feedback = JSON.parse(cleaned);
    
    // Validate STAR analysis structure
    const star = feedback.starAnalysis || {};
    const fb = feedback.feedback || {};
    
    return {
      starAnalysis: {
        situation: star.situation || "Not mentioned",
        task: star.task || "Not mentioned",
        action: star.action || "Not mentioned",
        result: star.result || "Not quantified"
      },
      feedback: {
        strengths: Array.isArray(fb.strengths) ? fb.strengths.filter(s => s) : [],
        weaknesses: Array.isArray(fb.weaknesses) ? fb.weaknesses.filter(w => w) : [],
        scoringRationale: fb.scoringRationale || ""
      },
      improvedAnswer: feedback.improvedAnswer || "",
      overallScore: feedback.overallScore || "N/A"
    };
  } catch (e) {
    return { rawOutput: text };
  }
}

module.exports = { evaluateAnswer };
