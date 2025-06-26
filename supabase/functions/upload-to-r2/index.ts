import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { hmac } from 'https://deno.land/x/hmac@v2.0.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- AWS Signature V4 Manual Signing Helper Functions ---

async function sha256(data: string): Promise<string> {
  const G_textEncoder = new TextEncoder();
  const G_encodedData = G_textEncoder.encode(data);
  const G_hashBuffer = await crypto.subtle.digest('SHA-256', G_encodedData);
  const G_hashArray = Array.from(new Uint8Array(G_hashBuffer));
  return G_hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function hmacSha256(key: Uint8Array, data: string): Uint8Array {
  return hmac('sha256', key, data, 'utf8', 'binary') as Uint8Array;
}

// --- Main Edge Function ---

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. AUTHENTICATE USER
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 2. PARSE FORM DATA
    const formData = await req.formData();
    const file = formData.get('file');
    const uploadType = formData.get('uploadType') || 'community';
    if (!file || typeof file === 'string') {
      throw new Error('No file provided');
    }

    // 3. PREPARE FILE AND METADATA
    const fileBuffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const key = `${uploadType}/${user.id}/${timestamp}.${fileExtension}`;
    
    // 4. MANUALLY CREATE THE SECURE AWS V4 SIGNATURE
    const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')!;
    const accessKeyId = Deno.env.get('CLOUDFLARE_COMMUNITY_POST_ACCESS_KEY_ID')!;
    const secretAccessKey = Deno.env.get('CLOUDFLARE_COMMUNITY_POST_SECRET_ACCESS_KEY')!;
    const bucketName = 'wellness-images';

    const host = `${accountId}.r2.cloudflarestorage.com`;
    const region = 'auto';
    const service = 's3';
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);
    
    const canonicalURI = `/${bucketName}/${key}`;
    const hashedPayload = await sha256(new TextDecoder().decode(fileBuffer));
    
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${hashedPayload}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    
    const canonicalRequest = `PUT\n${canonicalURI}\n\n${canonicalHeaders}\n${signedHeaders}\n${hashedPayload}`;
    const hashedCanonicalRequest = await sha256(canonicalRequest);
    
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${hashedCanonicalRequest}`;

    const kDate = hmacSha256(new TextEncoder().encode('AWS4' + secretAccessKey), dateStamp);
    const kRegion = hmacSha256(kDate, region);
    const kService = hmacSha256(kRegion, service);
    const kSigning = hmacSha256(kService, 'aws4_request');
    const signature = hmac('sha256', kSigning, stringToSign, 'utf8', 'hex');

    const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    
    // 5. UPLOAD THE FILE USING FETCH WITH THE MANUAL SIGNATURE
    const uploadUrl = `https://${host}${canonicalURI}`;
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': authorizationHeader,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': hashedPayload,
        'Content-Type': file.type,
        'Content-Length': file.size.toString(),
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      throw new Error(`R2 Upload Failed: ${await response.text()}`);
    }

    // 6. GENERATE AND RETURN THE PUBLIC URL
    const publicUrlHost = Deno.env.get('R2_PUBLIC_URL_HOST');
    if (!publicUrlHost) throw new Error('R2 public URL host not configured in secrets.');
    const imageUrl = `https://${publicUrlHost}/${key}`;

    return new Response(JSON.stringify({ success: true, imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Upload error:', error.message);
    return new Response(JSON.stringify({ error: 'Upload failed', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});