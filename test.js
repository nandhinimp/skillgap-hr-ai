import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // loads .env file

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const prompt = fs.readFileSync("prompt.txt", "utf8");

async function run() {
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: prompt },
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
    temperature: 0.2
  });

  console.log(response.choices[0].message.content);
}

run();
