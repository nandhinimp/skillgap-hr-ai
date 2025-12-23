require("dotenv").config();
const fs = require("fs");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Load resume analysis prompt
const systemPrompt = fs.readFileSync("prompt.txt", "utf8");

async function analyzeResumeFromPDF(pdfPath, jobDescription) {
  try {
    console.log("📄 Reading resume PDF...");

    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    console.log("🧠 Sending extracted resume + JD to AI...");

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
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

    console.log("✅ Resume Analysis Result:");
    console.log(completion.choices[0].message.content);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// 🔽 TESTING PURPOSE
const jobDescription = `
Looking for a backend developer with experience in Node.js,
JWT authentication, REST API security, and leadership skills.
`;

// Put your resume PDF path here
analyzeResumeFromPDF("./resume.pdf", jobDescription);
