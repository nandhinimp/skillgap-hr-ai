require("dotenv").config();
const fs = require("fs");
const Groq = require("groq-sdk");

// Create Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Load prompt
const systemPrompt = fs.readFileSync("prompt.txt", "utf8");

async function run() {
  try {
    console.log("🧠 Sending resume analysis request to Groq...");

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `
Resume:
Built React applications and Node.js APIs.
Managed 3 interns.

Job Description:
Looking for a backend developer with JWT authentication,
REST API security, and leadership experience.
`
        }
      ],
      temperature: 0.2,
    });

    console.log("✅ AI Response:");
    console.log(completion.choices[0].message.content);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

run();
