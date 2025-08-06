import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const url = new URL(req.url);
    const invite_code = url.searchParams.get('invite_code');

    if (!invite_code) {
      throw new Error("Missing invite code");
    }

    // Get group purchase details (public view)
    const { data: groupPurchase, error: groupError } = await supabaseClient
      .from('group_purchases')
      .select(`
        *,
        programs:program_id (name, duration_days, description, features),
        group_purchase_participants (
          user_id,
          joined_at,
          payment_status
        )
      `)
      .eq('invite_code', invite_code)
      .eq('status', 'active')
      .single();

    if (groupError || !groupPurchase) {
      throw new Error("Invalid or expired invite code");
    }

    // Calculate time remaining
    const expiresAt = new Date(groupPurchase.expires_at);
    const now = new Date();
    const timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime());
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

    return new Response(JSON.stringify({
      success: true,
      group_purchase: {
        ...groupPurchase,
        hours_remaining: hoursRemaining,
        is_expired: timeRemaining <= 0,
        participants_count: groupPurchase.group_purchase_participants.length,
        spots_remaining: groupPurchase.target_size - groupPurchase.current_size
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});