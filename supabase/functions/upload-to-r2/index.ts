
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('uploadType') as string;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uploadType}/${user.id}/${timestamp}.${fileExtension}`;

    // Convert file to array buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to Cloudflare R2
    const r2Response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${Deno.env.get('CLOUDFLARE_ACCOUNT_ID')}/r2/buckets/wellness-images/objects/${fileName}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('CLOUDFLARE_API_TOKEN')}`,
          'Content-Type': file.type,
        },
        body: fileBuffer,
      }
    );

    if (!r2Response.ok) {
      const errorText = await r2Response.text();
      console.error('R2 upload failed:', errorText);
      throw new Error(`R2 upload failed: ${r2Response.statusText}`);
    }

    // Generate the public URL
    const imageUrl = `https://pub-${Deno.env.get('CLOUDFLARE_ACCOUNT_ID')}.r2.dev/wellness-images/${fileName}`;

    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl,
      fileName 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      error: 'Upload failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
