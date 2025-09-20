// Free translation service using MyMemory API
// No API key required, completely free for our use case

export interface TranslationResult {
  en: string;
  es: string;
  tr: string;
}

// Language detection using simple heuristics
export function detectLanguage(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Turkish specific characters and common words
  const turkishIndicators = ['ı', 'ğ', 'ü', 'ş', 'ö', 'ç', 'merhaba', 'teşekkür', 'çalışan', 'görev', 'tamamla'];
  
  // Spanish specific characters and common words
  const spanishIndicators = ['ñ', 'á', 'é', 'í', 'ó', 'ú', 'hola', 'gracias', 'empleado', 'tarea', 'completar'];
  
  // English common words (default)
  const englishIndicators = ['the', 'and', 'task', 'complete', 'employee', 'manager', 'hello', 'thank'];
  
  let turkishScore = 0;
  let spanishScore = 0;
  let englishScore = 0;
  
  // Count indicators
  turkishIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) turkishScore++;
  });
  
  spanishIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) spanishScore++;
  });
  
  englishIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) englishScore++;
  });
  
  // Return the language with highest score
  if (turkishScore > spanishScore && turkishScore > englishScore) return 'tr';
  if (spanishScore > englishScore) return 'es';
  return 'en'; // Default to English
}

async function translateWithMyMemory(text: string, fromLang: string, toLang: string): Promise<string> {
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`);
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    
    throw new Error('Translation API failed');
  } catch (error) {
    console.warn(`Translation failed for ${fromLang} -> ${toLang}:`, error);
    return text; // Return original text as fallback
  }
}

export async function translateText(text: string, detectedLanguage?: string): Promise<TranslationResult> {
  try {
    console.log('=== FREE TRANSLATION FUNCTION START ===');
    console.log('Input text:', text);
    console.log('Detected language:', detectedLanguage);
    
    // Quick validation
    if (!text || text.trim().length === 0) {
      console.log('Empty text, returning as-is');
      return { en: text, es: text, tr: text };
    }

    // Detect language if not provided
    const sourceLang = detectedLanguage || detectLanguage(text);
    console.log('Source language:', sourceLang);
    
    // Initialize result with original text
    const result: TranslationResult = {
      en: text,
      es: text,
      tr: text
    };

    // Only translate if text is longer than 2 characters to avoid API waste
    if (text.trim().length <= 2) {
      console.log('Text too short, skipping translation');
      return result;
    }

    // Translate to the other two languages based on detected language
    switch (sourceLang) {
      case 'en':
        console.log('Translating from English to Spanish and Turkish');
        result.es = await translateWithMyMemory(text, 'en', 'es');
        result.tr = await translateWithMyMemory(text, 'en', 'tr');
        break;
        
      case 'es':
        console.log('Translating from Spanish to English and Turkish');
        result.en = await translateWithMyMemory(text, 'es', 'en');
        result.tr = await translateWithMyMemory(text, 'es', 'tr');
        break;
        
      case 'tr':
        console.log('Translating from Turkish to English and Spanish');
        result.en = await translateWithMyMemory(text, 'tr', 'en');
        result.es = await translateWithMyMemory(text, 'tr', 'es');
        break;
        
      default:
        console.log('Unknown language, translating from English as default');
        result.es = await translateWithMyMemory(text, 'en', 'es');
        result.tr = await translateWithMyMemory(text, 'en', 'tr');
    }

    console.log('Translation successful:', result);
    return result;
    
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