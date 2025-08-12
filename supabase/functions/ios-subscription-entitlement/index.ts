import { serve } from "https://deno.land/std@0.219.1/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map Apple product IDs to program durations (days)
const PRODUCT_TO_DURATION: Record<string, number> = {
  "care.yogi.app.membership.monthly": 30,
  "care.yogi.app.membership.2month": 60,
  "care.yogi.app.membership.quarterly": 90,
};

async function verifyWithApple(receiptData: string, password: string) {
  const payload = {
    "receipt-data": receiptData,
    password,
    "exclude-old-transactions": true,
  };

  // Try production first
  let resp = await fetch("https://buy.itunes.apple.com/verifyReceipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let data = await resp.json();

  // If status 21007, retry in sandbox
  if (data?.status === 21007) {
    resp = await fetch("https://sandbox.itunes.apple.com/verifyReceipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    data = await resp.json();
  }

  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader ?? "" } },
    });

    // Ensure user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const { action, receiptData, productId } = body ?? {};

    if (action !== "verify_receipt" || !receiptData || !productId) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const sharedSecret = Deno.env.get("APPLE_IAP_SHARED_SECRET");
    if (!sharedSecret) {
      return new Response(JSON.stringify({ error: "Missing Apple shared secret" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify with Apple
    const appleResp = await verifyWithApple(receiptData, sharedSecret);

    if (appleResp?.status !== 0) {
      console.error("Apple verifyReceipt failed", appleResp);
      return new Response(JSON.stringify({ success: false, apple: appleResp }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Find latest subscription entry for this product
    const allInfos = (
      appleResp?.latest_receipt_info ||
      appleResp?.receipt?.in_app ||
      []
    ) as Array<any>;

    const matching = allInfos.filter((i) => i.product_id === productId);
    if (!matching.length) {
      return new Response(JSON.stringify({ success: false, reason: "NO_PRODUCT_IN_RECEIPT" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Pick most recent by expires_date_ms if present, else by purchase_date_ms
    const latest = matching.sort((a, b) => {
      const ax = Number(a.expires_date_ms || a.purchase_date_ms || 0);
      const bx = Number(b.expires_date_ms || b.purchase_date_ms || 0);
      return bx - ax;
    })[0];

    const expiresMs = Number(latest.expires_date_ms || 0);
    const nowMs = Date.now();
    const isActive = expiresMs > nowMs;

    // Map to a program by duration
    const durationDays = PRODUCT_TO_DURATION[productId];
    if (!durationDays) {
      return new Response(JSON.stringify({ success: false, reason: "UNKNOWN_PRODUCT" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Find program by duration
    const { data: programs, error: progErr } = await supabase
      .from("programs")
      .select("id, duration_days")
      .eq("duration_days", durationDays)
      .limit(1);
    if (progErr || !programs?.length) {
      console.error("Program lookup failed", progErr);
      return new Response(JSON.stringify({ success: false, reason: "PROGRAM_NOT_FOUND" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const programId = programs[0].id as string;

    // Mark existing subscriptions as completed, then insert/update active based on Apple expiration
    // Complete existing
    const { error: completeErr } = await supabase
      .from("user_subscriptions")
      .update({ status: "completed" })
      .eq("user_id", userId)
      .eq("status", "active");
    if (completeErr) console.error("Complete existing subs error", completeErr);

    // Insert new record using Apple expiration
    const startDate = new Date().toISOString();
    const endDate = new Date(expiresMs || nowMs).toISOString();

    const { data: inserted, error: insertErr } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        program_id: programId,
        status: isActive ? "active" : "completed",
        start_date: startDate,
        end_date: endDate,
        source: "apple_iap",
      })
      .select("id")
      .limit(1);

    if (insertErr) {
      console.error("Insert subscription error", insertErr);
      return new Response(JSON.stringify({ success: false, reason: "DB_INSERT_FAILED" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ success: true, subscription_id: inserted?.[0]?.id, isActive, expires_at: endDate }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error("ios-subscription-entitlement error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
