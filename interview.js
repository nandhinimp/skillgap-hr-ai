require("dotenv").config();
const fs = require("fs");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = fs.readFileSync("prompt-interview.txt", "utf8");

async function generateQuestions() {
  try {
    console.log("🧠 Generating interview questions...");

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `
Missing Skills:
- JWT authentication
- REST API security
`
        }
      ],
      temperature: 0.3,
    });

    console.log("✅ Interview Questions:");
    console.log(completion.choices[0].message.content);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

generateQuestions();
