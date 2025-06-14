
-- Create storage bucket for assessment photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('assessments', 'assessments', true);

-- Create policy for users to upload their own assessment photos
CREATE POLICY "Users can upload assessment photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'assessments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to view assessment photos  
CREATE POLICY "Users can view assessment photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'assessments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to delete their own assessment photos
CREATE POLICY "Users can delete assessment photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'assessments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
