-- Create storage bucket for task photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-photos', 'task-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for task photos
DROP POLICY IF EXISTS "Enable public read access on task photos" ON storage.objects;
CREATE POLICY "Enable public read access on task photos" ON storage.objects
FOR SELECT USING (bucket_id = 'task-photos');

DROP POLICY IF EXISTS "Enable authenticated upload for task photos" ON storage.objects;
CREATE POLICY "Enable authenticated upload for task photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'task-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable authenticated update for task photos" ON storage.objects;
CREATE POLICY "Enable authenticated update for task photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'task-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable authenticated delete for task photos" ON storage.objects;
CREATE POLICY "Enable authenticated delete for task photos" ON storage.objects
FOR DELETE USING (bucket_id = 'task-photos' AND auth.role() = 'authenticated');