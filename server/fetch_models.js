const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: "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"
});

async function main() {
  try {
    const models = await openai.models.list();
    console.log("Available models:");
    models.data.forEach(m => console.log(m.id));
  } catch (error) {
    console.error("Error fetching models:", error.message);
  }
}

main();
