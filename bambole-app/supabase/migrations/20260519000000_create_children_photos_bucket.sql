-- Create a new bucket for children-photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('children-photos', 'children-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view children photos
CREATE POLICY "Public Access children-photos" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'children-photos' );

-- Allow authenticated users to upload children photos
CREATE POLICY "Allow authenticated uploads children-photos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'children-photos' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update children photos
CREATE POLICY "Allow authenticated updates children-photos" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'children-photos' AND auth.role() = 'authenticated' )
WITH CHECK ( bucket_id = 'children-photos' AND auth.role() = 'authenticated' );

-- Allow authenticated users to delete children photos
CREATE POLICY "Allow authenticated deletes children-photos" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'children-photos' AND auth.role() = 'authenticated' );
