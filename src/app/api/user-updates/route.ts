import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// Interface for update data with dynamic content fields
interface UpdateData {
  user_id?: string;
  original_language?: string;
  content_en?: string;
  content_es?: string;
  content_tr?: string;
  photo_url?: string;
  is_visible?: boolean;
  translation_status?: string;
  [key: string]: string | boolean | undefined; // For dynamic content fields
}

// Type for database query result
type DatabaseUpdate = {
  id: string;
  user_id: string;
  original_language: string;
  content_en?: string;
  content_es?: string;
  content_tr?: string;
  html_content_en?: string;
  html_content_es?: string;
  html_content_tr?: string;
  photo_url?: string;
  photo_alt_text?: string;
  is_public: boolean;
  is_pinned: boolean;
  translation_status: string;
  created_at: string;
  updated_at: string;
  profiles?: Array<{ name: string; role: string }>;
  [key: string]: string | boolean | Array<{ name: string; role: string }> | undefined; // For dynamic content access
}

// Helper function to determine target languages for translation
function getTargetLanguages(originalLang: string): string[] {
  const allLanguages = ['en', 'es', 'tr'];
  return allLanguages.filter(lang => lang !== originalLang);
}

// Helper function to call translation API
async function translateContent(text: string, htmlContent: string, originalLanguage: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        htmlContent,
        originalLanguage,
        action: 'translate-update'
      })
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Translation API error:', await response.text());
      return null;
    }
  } catch (error) {
    console.error('Translation request failed:', error);
    return null;
  }
}

// GET - Fetch user updates with language filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId'); // Optional filter by user

    const supabase = supabaseAdmin;

    // Build query
    let query = supabase
      .from('user_updates')
      .select(`
        id,
        user_id,
        original_language,
        content_en,
        content_es,
        content_tr,
        html_content_en,
        html_content_es,
        html_content_tr,
        photo_url,
        photo_alt_text,
        is_public,
        is_pinned,
        translation_status,
        created_at,
        updated_at,
        profiles!user_id (
          name,
          role
        )
      `)
      .eq('is_public', true)
      .is('deleted_at', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: updates, error } = await query;

    if (error) {
      console.error('Error fetching user updates:', error);
      return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
    }

    // Format updates for the requested language
    const formattedUpdates = updates?.map((update: DatabaseUpdate) => ({
      id: update.id,
      user_id: update.user_id,
      user_name: update.profiles?.[0]?.name || 'Unknown User',
      user_role: update.profiles?.[0]?.role || 'User',
      original_language: update.original_language,
      content: update[`content_${language}`] || update[`content_${update.original_language}`] || update.content_en,
      html_content: update[`html_content_${language}`] || update[`html_content_${update.original_language}`] || update.html_content_en,
      photo_url: update.photo_url,
      photo_alt_text: update.photo_alt_text,
      is_pinned: update.is_pinned,
      translation_status: update.translation_status,
      created_at: update.created_at,
      updated_at: update.updated_at,
      display_language: language
    })) || [];

    return NextResponse.json({
      success: true,
      updates: formattedUpdates,
      pagination: {
        limit,
        offset,
        has_more: updates?.length === limit
      }
    });

  } catch (error) {
    console.error('Error in GET /api/user-updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new user update with auto-translation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      content, 
      htmlContent, 
      originalLanguage, 
      photoUrl, 
      photoAltText,
      isPublic = true,
      isPinned = false 
    } = await request.json();

    if (!content || !originalLanguage) {
      return NextResponse.json(
        { error: 'Content and original language are required' }, 
        { status: 400 }
      );
    }

    if (!['en', 'es', 'tr'].includes(originalLanguage)) {
      return NextResponse.json(
        { error: 'Unsupported language. Supported: en, es, tr' }, 
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // First, create the update with original language content
    const updateData: UpdateData = {
      user_id: session.user.id,
      original_language: originalLanguage,
      [`content_${originalLanguage}`]: content,
      photo_url: photoUrl,
      photo_alt_text: photoAltText,
      is_public: isPublic,
      is_pinned: isPinned,
      translation_status: 'pending'
    };

    if (htmlContent) {
      updateData[`html_content_${originalLanguage}`] = htmlContent;
    }

    const { data: newUpdate, error: insertError } = await supabase
      .from('user_updates')
      .insert(updateData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user update:', insertError);
      return NextResponse.json({ error: 'Failed to create update' }, { status: 500 });
    }

    console.log(`🎉 Created user update ${newUpdate.id} in ${originalLanguage}`);

    // Start background translation process
    translateInBackground(newUpdate.id, content, htmlContent, originalLanguage);

    return NextResponse.json({
      success: true,
      update: newUpdate,
      message: 'Update created successfully. Translation in progress.'
    });

  } catch (error) {
    console.error('Error in POST /api/user-updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Background translation function
async function translateInBackground(updateId: string, content: string, htmlContent: string, originalLanguage: string) {
  try {
    console.log(`🌐 Starting background translation for update ${updateId}`);
    
    const targetLanguages = getTargetLanguages(originalLanguage);
    const translations: Record<string, string> = {};
    const htmlTranslations: Record<string, string> = {};

    // Translate to each target language
    for (const targetLang of targetLanguages) {
      try {
        console.log(`🔄 Translating ${updateId} to ${targetLang}...`);
        
        // Simple translation using the existing translation utility
        // In a production app, you'd use a proper translation service
        const translatedContent = await translateText(content, targetLang);
        translations[targetLang] = translatedContent;

        if (htmlContent) {
          const translatedHtml = await translateText(htmlContent, targetLang);
          htmlTranslations[targetLang] = translatedHtml;
        }

        console.log(`✅ ${targetLang} translation completed for update ${updateId}`);
      } catch (error) {
        console.error(`❌ Translation failed for ${targetLang} on update ${updateId}:`, error);
      }
    }

    // Update the database with translations
    const updateData: UpdateData = {};
    
    for (const [lang, translatedContent] of Object.entries(translations)) {
      updateData[`content_${lang}`] = translatedContent;
    }
    
    for (const [lang, translatedHtml] of Object.entries(htmlTranslations)) {
      updateData[`html_content_${lang}`] = translatedHtml;
    }

    updateData.translation_status = 'completed';
    updateData.translated_at = new Date().toISOString();
    updateData.translation_provider = 'internal';

    const supabase = supabaseAdmin;
    const { error: updateError } = await supabase
      .from('user_updates')
      .update(updateData)
      .eq('id', updateId);

    if (updateError) {
      console.error(`❌ Failed to save translations for update ${updateId}:`, updateError);
      
      // Mark translation as failed
      await supabase
        .from('user_updates')
        .update({ translation_status: 'failed' })
        .eq('id', updateId);
    } else {
      console.log(`🎉 Translations saved successfully for update ${updateId}`);
    }

  } catch (error) {
    console.error(`❌ Background translation failed for update ${updateId}:`, error);
    
    // Mark translation as failed
    try {
      const supabase = supabaseAdmin;
      await supabase
        .from('user_updates')
        .update({ translation_status: 'failed' })
        .eq('id', updateId);
    } catch (dbError) {
      console.error('Failed to update translation status:', dbError);
    }
  }
}

// Simple translation function (fallback)
async function translateText(text: string, targetLanguage: string): Promise<string> {
  // This is a very basic implementation for demo purposes
  // In production, you'd use Google Translate, Azure Translator, or similar service
  
  const prefixes = {
    en: '[AUTO-EN] ',
    es: '[AUTO-ES] ',
    tr: '[AUTO-TR] '
  };
  
  // Return text with language prefix for now
  return `${prefixes[targetLanguage as keyof typeof prefixes] || '[AUTO] '}${text}`;
}

// PUT - Update an existing user update
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      updateId,
      content, 
      htmlContent, 
      photoUrl, 
      photoAltText,
      isPublic,
      isPinned 
    } = await request.json();

    if (!updateId) {
      return NextResponse.json({ error: 'Update ID is required' }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    // Check if user owns the update or is a manager
    const { data: existingUpdate, error: fetchError } = await supabase
      .from('user_updates')
      .select('user_id, original_language')
      .eq('id', updateId)
      .single();

    if (fetchError || !existingUpdate) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    // Check authorization
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const isOwner = existingUpdate.user_id === session.user.id;
    const isManager = userProfile?.role === 'manager';

    if (!isOwner && !isManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prepare update data
    const updateData: UpdateData = {};
    
    if (content !== undefined) {
      updateData[`content_${existingUpdate.original_language}`] = content;
      // Reset translation status if content changed
      updateData.translation_status = 'pending';
    }
    
    if (htmlContent !== undefined) {
      updateData[`html_content_${existingUpdate.original_language}`] = htmlContent;
    }
    
    if (photoUrl !== undefined) updateData.photo_url = photoUrl;
    if (photoAltText !== undefined) updateData.photo_alt_text = photoAltText;
    if (isPublic !== undefined) updateData.is_public = isPublic;
    if (isPinned !== undefined && isManager) updateData.is_pinned = isPinned;

    const { data: updatedUpdate, error: updateError } = await supabase
      .from('user_updates')
      .update(updateData)
      .eq('id', updateId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user update:', updateError);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    // Re-translate if content was updated
    if (content !== undefined) {
      translateInBackground(updateId, content, htmlContent || '', existingUpdate.original_language);
    }

    return NextResponse.json({
      success: true,
      update: updatedUpdate,
      message: 'Update modified successfully.'
    });

  } catch (error) {
    console.error('Error in PUT /api/user-updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Soft delete a user update
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const updateId = searchParams.get('id');

    if (!updateId) {
      return NextResponse.json({ error: 'Update ID is required' }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    // Check if user owns the update or is a manager
    const { data: existingUpdate, error: fetchError } = await supabase
      .from('user_updates')
      .select('user_id')
      .eq('id', updateId)
      .single();

    if (fetchError || !existingUpdate) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    // Check authorization
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const isOwner = existingUpdate.user_id === session.user.id;
    const isManager = userProfile?.role === 'manager';

    if (!isOwner && !isManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete the update
    const { error: deleteError } = await supabase
      .from('user_updates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', updateId);

    if (deleteError) {
      console.error('Error deleting user update:', deleteError);
      return NextResponse.json({ error: 'Failed to delete update' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Update deleted successfully.'
    });

  } catch (error) {
    console.error('Error in DELETE /api/user-updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}