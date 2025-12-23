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

const resumePrompt = fs.readFileSync("prompt.txt", "utf8");

// ✅ STEP 1 API
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

    fs.unlinkSync(req.file.path); // delete uploaded PDF

    const analysisText = completion.choices[0].message.content;
    let analysisJSON;

    try {
      analysisJSON = JSON.parse(analysisText);
    } catch {
      analysisJSON = { rawOutput: analysisText };
    }

    res.json({ analysis: analysisJSON });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Analysis failed" });
  }
});

app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
