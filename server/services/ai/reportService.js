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
 * Analyze a blood report's extracted text using OpenAI.
 * Identifies lab parameters, compares against standard reference ranges,
 * and returns structured findings.
 *
 * @param {string} extractedText - The text extracted from the blood report (PDF/image/pasted)
 * @returns {Object} { status, findings, summary }
 */
async function analyzeReport(extractedText) {
  const systemPrompt = `You are a medical lab report analysis AI. The user will provide text extracted from a blood test / lab report. Your job is to:

1. Identify all lab parameters mentioned in the report.
2. Extract their values.
3. Compare each parameter against standard medical reference ranges.
4. Flag parameters that are outside normal ranges as "low", "high", or "critical".
5. Provide a plain-language explanation for each flagged parameter.
6. Determine overall status: "normal" if all parameters are within range, "attention" if any are outside range.
7. Write a brief 2-3 sentence summary in plain language.

IMPORTANT RULES:
- Use standard medical reference ranges appropriate for adults.
- If the report text is unclear or unreadable, still return valid JSON with status "attention" and a summary noting the issue.
- Parameters within normal range should have flag "normal".
- Return ONLY valid JSON, no markdown, no code fences, no extra text.

Required JSON structure:
{
  "documentName": "Short descriptive name of the report type (e.g., 'Complete Blood Count', 'Thyroid Profile')",
  "status": "normal" or "attention",
  "findings": [
    {
      "parameter": "Parameter Name",
      "value": "extracted value with unit",
      "normalRange": "min–max unit",
      "flag": "normal" | "low" | "high" | "critical",
      "explanation": "Plain-language explanation (empty string if normal)"
    }
  ],
  "summary": "Plain-language 2-3 sentence overall summary."
}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here is my blood test report:\n\n${extractedText}` },
      ],
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content;
    const parsed = JSON.parse(responseText);

    // Validate and normalize structure
    const status = parsed.status === 'normal' ? 'normal' : 'attention';

    const findings = Array.isArray(parsed.findings)
      ? parsed.findings.map(f => ({
          parameter: f.parameter || 'Unknown',
          value: f.value || 'N/A',
          normalRange: f.normalRange || 'N/A',
          flag: ['normal', 'low', 'high', 'critical'].includes(f.flag)
            ? f.flag
            : 'normal',
          explanation: f.explanation || '',
        }))
      : [];

    const summary = typeof parsed.summary === 'string'
      ? parsed.summary
      : 'Report analysis completed. Please review the findings.';

    const documentName = typeof parsed.documentName === 'string'
      ? parsed.documentName
      : 'Lab Report';

    return { documentName, status, findings, summary };
  } catch (error) {
    console.error('Report analysis error:', error.message);

    if (error.status === 401 || error.code === 'invalid_api_key') {
      throw new Error('Groq API key is invalid or not configured. Please check your GROQ_API_KEY.');
    }

    if (error.status === 429) {
      throw new Error('AI service is temporarily busy. Please try again in a moment.');
    }

    throw new Error('Failed to analyze report. Please try again.');
  }
}

module.exports = { analyzeReport };
