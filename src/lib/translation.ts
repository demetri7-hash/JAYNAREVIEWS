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
    console.log('=== TRANSLATION FUNCTION START ===');
    console.log('Input text:', text);
    console.log('Detected language:', detectedLanguage);
    
    // Quick validation
    if (!text || text.trim().length === 0) {
      console.log('Empty text, returning as-is');
      return { en: text, es: text, tr: text };
    }

    // Check if OpenAI API key is configured
    console.log('Checking OpenAI API key...');
    console.log('API key exists:', !!process.env.OPENAI_API_KEY);
    console.log('API key length:', process.env.OPENAI_API_KEY?.length || 0);
    console.log('API key starts with:', process.env.OPENAI_API_KEY?.substring(0, 7) || 'N/A');
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.warn('OpenAI API key not configured, returning original text for all languages');
      return { en: text, es: text, tr: text };
    }

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

    console.log('Making OpenAI API call...');
    console.log('Model: gpt-3.5-turbo');
    console.log('Prompt preview:', prompt.substring(0, 100) + '...');

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // Changed from gpt-4 to more reliable model
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

    console.log('OpenAI response received, parsing...');
    const translationText = response.choices[0]?.message?.content;
    console.log('Translation response text:', translationText);
    
    if (!translationText) {
      throw new Error('No translation received from OpenAI');
    }

    const translations = JSON.parse(translationText);
    console.log('Parsed translations:', translations);
    
    // Validate the response has all required fields
    if (!translations.en || !translations.es || !translations.tr) {
      throw new Error('Invalid translation response format');
    }

    console.log('Translation successful:', translations);
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