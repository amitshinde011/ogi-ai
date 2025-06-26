import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
// Using the Deno-native S3 client
import { S3Bucket } from 'https://deno.land/x/s3@0.5.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize the R2 Bucket client
const bucket = new S3Bucket({
  accessKeyID: Deno.env.get('CLOUDFLARE_COMMUNITY_POST_ACCESS_KEY_ID')!,
  secretKey: Deno.env.get('CLOUDFLARE_COMMUNITY_POST_SECRET_ACCESS_KEY')!,
  bucket: 'wellness-images', // Make sure this is your correct R2 bucket name
  region: 'auto',
  endpointURL: `https://${Deno.env.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
});

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. VERIFY USER IS AUTHENTICATED
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 2. PARSE THE INCOMING FORM DATA
    const formData = await req.formData();
    const file = formData.get('file');
    const uploadType = formData.get('uploadType') || 'community';
    
    if (!file || typeof file === 'string') {
      throw new Error('No file provided or invalid file format');
    }

    // 3. SECURELY UPLOAD THE FILE TO R2
    const fileBuffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const key = `${uploadType}/${user.id}/${timestamp}.${fileExtension}`;

    await bucket.putObject(key, fileBuffer, {
      // =================================================================
      // ** THE FIX IS HERE: Explicitly providing the file size **
      // This one line solves the 'toFixed' error.
      // =================================================================
      contentLength: file.size,
      contentType: file.type,
    });

    // 4. GENERATE AND RETURN THE PUBLICLY ACCESSIBLE URL
    // This assumes your bucket is connected to a public domain for serving images
    const publicUrlHost = Deno.env.get('R2_PUBLIC_URL_HOST'); // e.g., 'pub-your-hash.r2.dev'
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
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { S3Bucket } from 'https://deno.land/x/s3@0.5.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize the R2 Bucket client
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
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file');
    const uploadType = formData.get('uploadType') || 'community';
    if (!file || typeof file === 'string') {
      throw new Error('No file provided');
    }

    // Prepare file for upload
    const fileBuffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const key = `${uploadType}/${user.id}/${timestamp}.${fileExtension}`;

    // =================================================================
    // ** THE FINAL FIX IS HERE **
    // We are setting partSize to be the same as the file's size.
    // This forces the library to upload the file in a single, non-streamed
    // chunk, which avoids the bug in the Deno runtime.
    // =================================================================
    await bucket.putObject(key, fileBuffer, {
      contentType: file.type,
      partSize: file.size, // Force single-part upload
    });

    // Generate and return the public URL
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