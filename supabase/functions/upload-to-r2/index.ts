import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { S3Bucket } from 'https://deno.land/x/s3@0.5.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const bucket = new S3Bucket({
  accessKeyID: Deno.env.get('CLOUDFLARE_COMMUNITY_POST_ACCESS_KEY_ID')!,
  secretKey: Deno.env.get('CLOUDFLARE_COMMUNITY_POST_SECRET_ACCESS_KEY')!,
  bucket: 'wellness-images', // Make sure this is your correct R2 bucket name
  region: 'auto',
  endpointURL: `https://${Deno.env.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 2. Parse the form data
    const formData = await req.formData();
    const file = formData.get('file');
    const uploadType = formData.get('uploadType') || 'community';
    if (!file || typeof file === 'string') {
      throw new Error('No file provided or invalid file format');
    }

    // 3. Prepare file for upload
    const fileBuffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const key = `${uploadType}/${user.id}/${timestamp}.${fileExtension}`;

    // 4. Securely upload the file to R2 with the fix
    await bucket.putObject(key, fileBuffer, {
      // =================================================================
      // ** THIS IS THE DEFINITIVE FIX FOR THE 'toFixed' ERROR **
      // This forces a single-part upload, bypassing the library bug.
      // =================================================================
      partSize: file.size,
      contentType: file.type,
    });

    // 5. Generate and return the public URL
    const publicUrlHost = Deno.env.get('R2_PUBLIC_URL_HOST');
    if (!publicUrlHost) throw new Error('R2 public URL host not configured in secrets.');
    const imageUrl = `https://${publicUrlHost}/${key}`;

    return new Response(JSON.stringify({ success: true, imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});