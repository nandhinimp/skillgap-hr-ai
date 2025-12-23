require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");
const cors = require("cors");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ===== PROMPTS =====
const resumePrompt = fs.readFileSync("prompt.txt", "utf8");
const interviewPrompt = fs.readFileSync("prompt-interview.txt", "utf8");
const evaluationPrompt = fs.readFileSync("prompt-evaluation.txt", "utf8");

// =====================================================
// ✅ STEP 1: RESUME ANALYSIS API
// =====================================================
app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription;

    if (!req.file || !jobDescription) {
      return res.status(400).json({
        error: "Resume PDF and Job Description are required",
      });
    }

    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: resumePrompt },
        {
          role: "user",
          content: `
Resume:
${resumeText}

Job Description:
${jobDescription}
          `,
        },
      ],
      temperature: 0.2,
    });

    fs.unlinkSync(req.file.path);

    const analysisText = completion.choices[0].message.content;
    let analysisJSON;

    try {
      analysisJSON = JSON.parse(analysisText);
    } catch {
      analysisJSON = { rawOutput: analysisText };
    }

    res.json({ analysis: analysisJSON });
  } catch (error) {
    console.error("❌ ANALYZE ERROR:", error.message);
    res.status(500).json({ error: "Analysis failed" });
  }
});

// =====================================================
// ✅ STEP 2: INTERVIEW QUESTION API
// =====================================================
app.post("/interview", async (req, res) => {
  try {
    const { missingSkills } = req.body;

    if (!missingSkills || !Array.isArray(missingSkills)) {
      return res.status(400).json({
        error: "missingSkills array is required",
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: interviewPrompt },
        {
          role: "user",
          content: `Missing Skills:\n${missingSkills.join("\n")}`,
        },
      ],
      temperature: 0.3,
    });

    const resultText = completion.choices[0].message.content;
    let resultJSON;

    try {
      // Clean markdown code blocks if present
      const cleaned = resultText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      resultJSON = JSON.parse(cleaned);
    } catch {
      resultJSON = { rawOutput: resultText };
    }

    res.json(resultJSON);
  } catch (error) {
    console.error("❌ INTERVIEW ERROR:", error.message);
    res.status(500).json({ error: "Interview generation failed" });
  }
});

// =====================================================
// ✅ STEP 3: ANSWER EVALUATION API
// =====================================================
app.post("/evaluate-answer", async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: evaluationPrompt },
        {
          role: "user",
          content: `
Question:
${question}

Candidate Answer:
${answer}
`
        }
      ],
      temperature: 0.2,
    });

    const aiText = completion.choices[0].message.content;

    // Remove ```json and ``` wrappers
    const cleanedText = aiText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedJSON;

    try {
      parsedJSON = JSON.parse(cleanedText);
    } catch (err) {
      return res.status(500).json({
        error: "Invalid AI JSON output",
        rawOutput: aiText
      });
    }

    res.json(parsedJSON);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Evaluation failed" });
  }
});

// =====================================================
app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
