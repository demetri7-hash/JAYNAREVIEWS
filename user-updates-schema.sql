-- User Updates with Auto-Translation Schema
-- This schema supports user-generated updates with automatic translation into all 3 languages

-- Create user_updates table
CREATE TABLE IF NOT EXISTS user_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  original_language VARCHAR(2) NOT NULL CHECK (original_language IN ('en', 'es', 'tr')),
  
  -- Content in all 3 languages (original + 2 auto-translated)
  content_en TEXT,
  content_es TEXT, 
  content_tr TEXT,
  
  -- Rich text support (HTML content)
  html_content_en TEXT,
  html_content_es TEXT,
  html_content_tr TEXT,
  
  -- Photo support
  photo_url TEXT,
  photo_alt_text TEXT,
  
  -- Metadata
  is_public BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Translation tracking
  translation_status VARCHAR(20) DEFAULT 'pending' CHECK (translation_status IN ('pending', 'completed', 'failed')),
  translated_at TIMESTAMP,
  translation_provider VARCHAR(50), -- 'google', 'azure', 'custom', etc.
  
  -- Standard timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Soft delete
  deleted_at TIMESTAMP,
  
  CONSTRAINT user_updates_content_check CHECK (
    -- At least one language content must exist
    (content_en IS NOT NULL OR content_es IS NOT NULL OR content_tr IS NOT NULL)
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_updates_user_id ON user_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_updates_created_at ON user_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_updates_public ON user_updates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_updates_language ON user_updates(original_language);
CREATE INDEX IF NOT EXISTS idx_user_updates_translation_status ON user_updates(translation_status);
CREATE INDEX IF NOT EXISTS idx_user_updates_active ON user_updates(deleted_at) WHERE deleted_at IS NULL;

-- Create user_update_reactions table for likes/reactions (future feature)
CREATE TABLE IF NOT EXISTS user_update_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  update_id UUID REFERENCES user_updates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'helpful', 'thanks')),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(update_id, user_id) -- One reaction per user per update
);

-- Create user_update_comments table (future feature)
CREATE TABLE IF NOT EXISTS user_update_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  update_id UUID REFERENCES user_updates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Comments also support translations
  original_language VARCHAR(2) NOT NULL CHECK (original_language IN ('en', 'es', 'tr')),
  content_en TEXT,
  content_es TEXT,
  content_tr TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create updated_at trigger for user_updates
CREATE OR REPLACE FUNCTION update_user_updates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_updates_updated_at_trigger
  BEFORE UPDATE ON user_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_user_updates_updated_at();

-- Create RLS policies for user_updates
ALTER TABLE user_updates ENABLE ROW LEVEL SECURITY;

-- Users can read all public updates
CREATE POLICY "Public updates are viewable by everyone" ON user_updates
  FOR SELECT USING (is_public = true AND deleted_at IS NULL);

-- Users can create their own updates
CREATE POLICY "Users can create their own updates" ON user_updates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own updates
CREATE POLICY "Users can update their own updates" ON user_updates
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can soft delete their own updates
CREATE POLICY "Users can delete their own updates" ON user_updates
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Managers can manage all updates
CREATE POLICY "Managers can manage all updates" ON user_updates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'manager'
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_updates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_update_reactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_update_comments TO authenticated;

-- Example data structure documentation
/*
Example user_updates record after auto-translation:

{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "user-uuid",
  "original_language": "tr",
  "content_en": "Great job everyone! The dinner service was amazing tonight.",
  "content_es": "¡Buen trabajo a todos! El servicio de cena fue increíble esta noche.",
  "content_tr": "Herkese harika iş! Bu akşam akşam yemeği servisi harikaydı.",
  "html_content_en": "<p>Great job everyone! The dinner service was <strong>amazing</strong> tonight.</p>",
  "html_content_es": "<p>¡Buen trabajo a todos! El servicio de cena fue <strong>increíble</strong> esta noche.</p>",
  "html_content_tr": "<p>Herkese harika iş! Bu akşam akşam yemeği servisi <strong>harikaydı</strong>.</p>",
  "photo_url": "https://storage.url/photo.jpg",
  "photo_alt_text": "Kitchen team celebrating successful service",
  "is_public": true,
  "translation_status": "completed",
  "translated_at": "2025-09-20T15:30:00Z",
  "translation_provider": "google",
  "created_at": "2025-09-20T15:29:45Z"
}

Translation Logic:
- If original_language = "en" → translate to "es" and "tr"
- If original_language = "es" → translate to "en" and "tr"  
- If original_language = "tr" → translate to "en" and "es"
*/