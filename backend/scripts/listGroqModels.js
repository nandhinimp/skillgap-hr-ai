trequire('dotenv').config();
const Groq = require('groq-sdk');

(async () => {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const models = await client.models.list();
    console.log('Available Groq models:');
    for (const m of models.data) {
      console.log('-', m.id);
    }
  } catch (e) {
    console.error('Failed to list Groq models:', e.message);
  }
})();
