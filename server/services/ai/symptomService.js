const OpenAI = require('openai');

let _openai = null;

function getOpenAI() {
  if (!_openai) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Groq API key is not configured. Please set GROQ_API_KEY in your .env file.');
    }
    _openai = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return _openai;
}

/**
 * Analyze user-described symptoms using OpenAI and return
 * possible conditions, recommended lab tests, and urgency level.
 *
 * @param {string} description - Free-text symptom description from the user
 * @returns {Object} { possibleConditions, recommendedTests, urgency }
 */
async function analyzeSymptoms(description) {
  const systemPrompt = `You are a medical AI assistant. The user will describe their symptoms in plain language. Your job is to analyze the symptoms and provide:
1. A list of possible conditions (2-5 most likely).
2. Recommended lab tests with reasons for each.
3. An urgency level: "routine" (can wait a few days), "soon" (should see a doctor within 1-2 days), or "urgent" (needs immediate medical attention).

IMPORTANT RULES:
- You are NOT diagnosing. You are suggesting possibilities and recommending tests.
- Always err on the side of caution with urgency.
- Return ONLY valid JSON, no markdown, no code fences, no extra text.
- Use the exact JSON structure shown below.

Required JSON structure:
{
  "possibleConditions": ["condition1", "condition2"],
  "recommendedTests": [
    { "test": "Test Name", "reason": "Why this test is recommended" }
  ],
  "urgency": "routine | soon | urgent"
}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `My symptoms: ${description}` },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content;
    const parsed = JSON.parse(responseText);

    // Validate structure
    return {
      possibleConditions: Array.isArray(parsed.possibleConditions)
        ? parsed.possibleConditions
        : [],
      recommendedTests: Array.isArray(parsed.recommendedTests)
        ? parsed.recommendedTests.map(t => ({
            test: t.test || 'Unknown Test',
            reason: t.reason || 'Recommended based on symptoms',
          }))
        : [],
      urgency: ['routine', 'soon', 'urgent'].includes(parsed.urgency)
        ? parsed.urgency
        : 'routine',
    };
  } catch (error) {
    console.error('Symptom analysis error:', error.message);

    // If it's an API key error, throw a specific message
    if (error.status === 401 || error.code === 'invalid_api_key') {
      throw new Error('Groq API key is invalid or not configured. Please check your GROQ_API_KEY.');
    }

    // For rate limiting
    if (error.status === 429) {
      throw new Error('AI service is temporarily busy. Please try again in a moment.');
    }

    throw new Error('Failed to analyze symptoms. Please try again.');
  }
}

module.exports = { analyzeSymptoms };
