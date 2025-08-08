import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[JOIN-GROUP-PURCHASE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { invite_code } = await req.json();
    logStep("Request data", { invite_code });

    if (!invite_code) {
      throw new Error("Missing invite code");
    }

    // Get group purchase details
    const { data: groupPurchase, error: groupError } = await supabaseClient
      .from('group_purchases')
      .select(`
        *,
        programs:program_id (name, duration_days),
        group_purchase_participants (user_id)
      `)
      .eq('invite_code', invite_code)
      .eq('status', 'active')
      .single();

    if (groupError || !groupPurchase) {
      throw new Error("Invalid or expired invite code");
    }

    // Check if group is full
    if (groupPurchase.current_size >= groupPurchase.target_size) {
      throw new Error("Group is already full");
    }

    // Check if user is already a participant
    const isAlreadyParticipant = groupPurchase.group_purchase_participants.some(
      (p: any) => p.user_id === user.id
    );

    if (isAlreadyParticipant) {
      throw new Error("You are already a member of this group");
    }

    // Add user as participant
    const { error: participantError } = await supabaseClient
      .from('group_purchase_participants')
      .insert({
        group_purchase_id: groupPurchase.id,
        user_id: user.id,
        payment_status: 'pending'
      });

    if (participantError) {
      logStep("Error adding participant", participantError);
      throw new Error(`Failed to join group: ${participantError.message}`);
    }

    // Get updated group purchase details
    const { data: updatedGroup, error: updateError } = await supabaseClient
      .from('group_purchases')
      .select(`
        *,
        programs:program_id (name, duration_days)
      `)
      .eq('id', groupPurchase.id)
      .single();

    if (updateError) {
      throw new Error("Failed to get updated group details");
    }

    logStep("User joined group successfully", { 
      groupPurchaseId: groupPurchase.id,
      newSize: updatedGroup.current_size 
    });

    return new Response(JSON.stringify({
      success: true,
      group_purchase: updatedGroup,
      message: `Successfully joined ${groupPurchase.programs.name} group! Current discount: ${updatedGroup.discount_percentage}%`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});