import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { translateText, detectLanguage } from '@/lib/translation';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Detect language and translate
    const detectedLang = detectLanguage(text);
    const translations = await translateText(text, detectedLang !== 'unknown' ? detectedLang : undefined);

    return NextResponse.json({ 
      success: true,
      originalText: text,
      detectedLanguage: detectedLang,
      translations 
    });
  } catch (error) {
    console.error('Error in POST /api/translate:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}