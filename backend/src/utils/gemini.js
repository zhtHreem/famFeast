import { HttpError } from './http.js';

export const aiEnabled = () => Boolean(process.env.GEMINI_API_KEY);

/**
 * Calls Gemini and returns parsed JSON.
 * @param {string} prompt
 * @param {{buffer: Buffer, mimetype: string} | null} image
 */
export const geminiJSON = async (prompt, image = null) => {
  if (!aiEnabled()) throw new HttpError(503, 'AI features are not configured on this server.');
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const parts = [{ text: prompt }];
  if (image) parts.push({ inline_data: { mime_type: image.mimetype, data: image.buffer.toString('base64') } });

  let res;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new HttpError(504, 'The AI service did not respond. Please try again.');
  }
  if (res.status === 429) throw new HttpError(429, 'The AI service is busy right now. Please try again shortly.');
  if (!res.ok) throw new HttpError(502, 'The AI service returned an error.');

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(502, 'The AI service returned an unreadable answer.');
  }
};
