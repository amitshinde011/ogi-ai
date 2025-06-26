import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
// ** NEW: Using a different, more modern Deno S3 library **
import { S3 } from 'https://deno.land/x/aws_api@v0.8.1/s3/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ** NEW: Client Configuration for the 'aws-api' library **
const s3 = new S3({
  accessKeyID: Deno.env.get('CLOUDFLARE_COMMUNITY_POST_ACCESS_KEY_ID')!,
  secretKey: Deno.env.get('CLOUDFLARE_COMMUNITY_POST_SECRET_ACCESS_KEY')!,
  region: 'auto',
  endpointURL: `https://${Deno.env.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
});

const bucketName = 'wellness-images';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get('file');
    const uploadType = formData.get('uploadType') || 'community';
    if (!file || typeof file === 'string') {
      throw new Error('No file provided');
    }

    // 3. Prepare file for upload
    const fileBuffer = new Uint8Array(await file.arrayBuffer()); // This library works best with Uint8Array
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const key = `${uploadType}/${user.id}/${timestamp}.${fileExtension}`;

    // 4. Securely upload the file to R2 using the new library
    await s3.putObject({
      bucket: bucketName,
      key: key,
      body: fileBuffer,
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