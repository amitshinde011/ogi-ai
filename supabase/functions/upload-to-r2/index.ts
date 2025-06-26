import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
// Using the same Deno-native S3 client as before
import { S3Bucket } from 'https://deno.land/x/s3@0.5.0/mod.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
// ** NEW: Simplified R2 Bucket Configuration **
const bucket = new S3Bucket({
  accessKeyID: Deno.env.get('CLOUDFLARE_COMMUNITY_POST_ACCESS_KEY_ID'),
  secretKey: Deno.env.get('CLOUDFLARE_COMMUNITY_POST_SECRET_ACCESS_KEY'),
  bucket: 'wellness-images',
  region: 'auto',
  endpointURL: `https://${Deno.env.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`
});
Deno.serve(async (req)=>{
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // 1. VERIFY USER IS AUTHENTICATED
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'), {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    // 2. PARSE FORM DATA
    const formData = await req.formData();
    const file = formData.get('file');
    const uploadType = formData.get('uploadType') || 'community'; // Default to community
    if (!file || typeof file === 'string') {
      throw new Error('No file provided or invalid file format');
    }
    // 3. SECURELY UPLOAD THE FILE TO R2
    const fileBuffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const key = `${uploadType}/${user.id}/${timestamp}.${fileExtension}`;
    await bucket.putObject(key, fileBuffer, {
      contentType: file.type
    });
    // 4. GENERATE AND RETURN THE PUBLICLY ACCESSIBLE URL
    // This assumes your bucket is connected to a public domain for serving images
    const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const imageUrl = `https://pub-${accountId}.r2.dev/wellness-images/${key}`; // Your public R2.dev URL
    return new Response(JSON.stringify({
      success: true,
      imageUrl
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({
      error: 'Upload failed',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
