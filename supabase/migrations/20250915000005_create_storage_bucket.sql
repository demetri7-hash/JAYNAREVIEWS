-- Create storage bucket for task photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-photos', 'task-photos', true);

-- Create storage policy for task photos
CREATE POLICY "Enable public read access on task photos" ON storage.objects
FOR SELECT USING (bucket_id = 'task-photos');

CREATE POLICY "Enable authenticated upload for task photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'task-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Enable authenticated update for task photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'task-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Enable authenticated delete for task photos" ON storage.objects
FOR DELETE USING (bucket_id = 'task-photos' AND auth.role() = 'authenticated');