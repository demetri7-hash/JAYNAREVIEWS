import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranslationResult {
  en: string;
  es: string;
  tr: string;
}

export async function translateText(text: string, detectedLanguage?: string): Promise<TranslationResult> {
  try {
    const prompt = `
Translate the following text into English, Latin American Spanish, and Turkish. 
${detectedLanguage ? `The original text is in ${detectedLanguage}.` : 'Auto-detect the original language.'}

Text to translate: "${text}"

Respond in JSON format:
{
  "en": "English translation",
  "es": "Latin American Spanish translation", 
  "tr": "Turkish translation"
}

Requirements:
- Keep translations concise and professional
- Use Latin American Spanish variant (not European Spanish)
- For Turkish, use modern business Turkish
- If original is already in one of the target languages, keep it unchanged for that language
- Maintain the tone and context (workplace/restaurant management)
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional translator specializing in restaurant and workplace management terminology. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const translationText = response.choices[0]?.message?.content;
    if (!translationText) {
      throw new Error('No translation received from OpenAI');
    }

    const translations = JSON.parse(translationText);
    
    // Validate the response has all required fields
    if (!translations.en || !translations.es || !translations.tr) {
      throw new Error('Invalid translation response format');
    }

    return translations;
  } catch (error) {
    console.error('Translation error:', error);
    
    // Fallback: return original text for all languages if translation fails
    return {
      en: text,
      es: text,
      tr: text
    };
  }
}

export function detectLanguage(text: string): 'en' | 'es' | 'tr' | 'unknown' {
  // Simple language detection based on common words/patterns
  const spanishPatterns = /\b(el|la|los|las|un|una|de|en|con|por|para|que|es|son|está|están|tiene|tienen|hace|hacer|trabajo|tarea|cocina|restaurante|gerente|empleado)\b/gi;
  const turkishPatterns = /\b(ve|bir|bu|şu|için|ile|olan|yapı|yapmak|çalışma|görev|mutfak|restoran|müdür|çalışan|ğ|ı|ş|ç|ö|ü)\b/gi;
  const englishPatterns = /\b(the|and|is|are|to|for|with|that|this|work|task|kitchen|restaurant|manager|employee)\b/gi;

  const spanishCount = (text.match(spanishPatterns) || []).length;
  const turkishCount = (text.match(turkishPatterns) || []).length;
  const englishCount = (text.match(englishPatterns) || []).length;

  if (spanishCount > turkishCount && spanishCount > englishCount) return 'es';
  if (turkishCount > spanishCount && turkishCount > englishCount) return 'tr';
  if (englishCount > 0) return 'en';
  
  return 'unknown';
}