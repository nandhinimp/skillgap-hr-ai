const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const promptPath = path.join(__dirname, "../prompts/prompt-interview.txt");
const systemPrompt = fs.readFileSync(promptPath, "utf8");

async function generateInterviewQuestions(missingSkills, resumeText = "", jdText = "") {
  const userContent = `Missing Skills:
${(missingSkills || []).join("\n")}

=== CANDIDATE'S ACTUAL RESUME ===
${resumeText.substring(0, 3000)}

=== SPECIFIC JOB DESCRIPTION ===
${jdText.substring(0, 2000)}

IMPORTANT: Generate questions that are 100% unique to THIS candidate and THIS job. Reference actual project names, companies, technologies from the resume and specific requirements from the JD. Never use generic templates.`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.8,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: userContent,
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
    const data = JSON.parse(cleaned);
    
    // Validate questions structure
    const questions = Array.isArray(data.questions) ? data.questions : [];
    
    // Ensure each question has required fields
    const validated = questions
      .filter(q => q.skill && q.question)
      .map(q => ({
        skill: q.skill.trim(),
        question: q.question.trim(),
        type: q.type || "technical"
      }));
    
    return { questions: validated };
  } catch (e) {
    return { rawOutput: text };
  }
}

module.exports = { generateInterviewQuestions };
