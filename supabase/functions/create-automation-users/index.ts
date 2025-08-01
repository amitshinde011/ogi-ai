import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface BotProfile {
  name: string
  timezone: string
  persona_type: string
  cuisine_specialty: string[]
  profile_photo_url: string
}

const botProfiles: BotProfile[] = [
  // India/Asia (15 bots)
  { name: "Priya Sharma", timezone: "Asia/Kolkata", persona_type: "nutritionist", cuisine_specialty: ["indian", "ayurvedic"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=b6e3f4" },
  { name: "Rahul Patel", timezone: "Asia/Kolkata", persona_type: "fitness_enthusiast", cuisine_specialty: ["indian", "protein_rich"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahul&backgroundColor=c0aede" },
  { name: "Ananya Singh", timezone: "Asia/Kolkata", persona_type: "plant_based", cuisine_specialty: ["indian", "vegan"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ananya&backgroundColor=d1d4f7" },
  { name: "Vikram Kumar", timezone: "Asia/Kolkata", persona_type: "traditional_cuisine", cuisine_specialty: ["indian", "regional"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=vikram&backgroundColor=ffd93d" },
  { name: "Meera Nair", timezone: "Asia/Kolkata", persona_type: "wellness_coach", cuisine_specialty: ["kerala", "coconut_based"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=meera&backgroundColor=ffb3ba" },
  { name: "Arjun Reddy", timezone: "Asia/Kolkata", persona_type: "fitness_enthusiast", cuisine_specialty: ["south_indian", "fermented"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun&backgroundColor=bae1ff" },
  { name: "Shreya Gupta", timezone: "Asia/Kolkata", persona_type: "nutritionist", cuisine_specialty: ["north_indian", "balanced"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=shreya&backgroundColor=a8e6cf" },
  { name: "Kiran Shah", timezone: "Asia/Kolkata", persona_type: "busy_professional", cuisine_specialty: ["gujarati", "quick_meals"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=kiran&backgroundColor=ffaaa5" },
  { name: "Neha Joshi", timezone: "Asia/Kolkata", persona_type: "plant_based", cuisine_specialty: ["maharashtrian", "plant_protein"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=neha&backgroundColor=ff9aa2" },
  { name: "Rajesh Iyer", timezone: "Asia/Kolkata", persona_type: "traditional_cuisine", cuisine_specialty: ["tamil", "rice_based"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh&backgroundColor=b4f8c8" },
  { name: "Aditi Rao", timezone: "Asia/Kolkata", persona_type: "wellness_coach", cuisine_specialty: ["andhra", "spice_balance"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=aditi&backgroundColor=fbe4ff" },
  { name: "Sanjay Verma", timezone: "Asia/Kolkata", persona_type: "busy_professional", cuisine_specialty: ["punjabi", "hearty_meals"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=sanjay&backgroundColor=e6e6fa" },
  { name: "Kavya Menon", timezone: "Asia/Kolkata", persona_type: "nutritionist", cuisine_specialty: ["malayali", "coconut_curry"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=kavya&backgroundColor=b5ead7" },
  { name: "Amit Agarwal", timezone: "Asia/Kolkata", persona_type: "fitness_enthusiast", cuisine_specialty: ["rajasthani", "desert_nutrition"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=amit&backgroundColor=f2cc8f" },
  { name: "Deepika Pillai", timezone: "Asia/Kolkata", persona_type: "plant_based", cuisine_specialty: ["kerala", "tropical_fruits"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=deepika&backgroundColor=f3e5f5" },

  // Europe (12 bots)
  { name: "Sofia Martinez", timezone: "Europe/Madrid", persona_type: "nutritionist", cuisine_specialty: ["mediterranean", "olive_oil"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=sofia&backgroundColor=ffe5e5" },
  { name: "Marco Rossi", timezone: "Europe/Rome", persona_type: "traditional_cuisine", cuisine_specialty: ["italian", "pasta"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=marco&backgroundColor=e5f3ff" },
  { name: "Elena Popov", timezone: "Europe/Sofia", persona_type: "plant_based", cuisine_specialty: ["eastern_european", "fermented"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena&backgroundColor=e5ffe5" },
  { name: "Andreas Mueller", timezone: "Europe/Berlin", persona_type: "fitness_enthusiast", cuisine_specialty: ["german", "whole_grains"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=andreas&backgroundColor=fff5e5" },
  { name: "Camille Dubois", timezone: "Europe/Paris", persona_type: "wellness_coach", cuisine_specialty: ["french", "seasonal"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=camille&backgroundColor=f5e5ff" },
  { name: "Lars Andersson", timezone: "Europe/Stockholm", persona_type: "nutritionist", cuisine_specialty: ["scandinavian", "fish"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=lars&backgroundColor=e5fff5" },
  { name: "Isabella Garcia", timezone: "Europe/Madrid", persona_type: "busy_professional", cuisine_specialty: ["spanish", "tapas"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=isabella&backgroundColor=fffee5" },
  { name: "Dimitri Kostas", timezone: "Europe/Athens", persona_type: "traditional_cuisine", cuisine_specialty: ["greek", "legumes"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=dimitri&backgroundColor=e5e5ff" },
  { name: "Anna Novak", timezone: "Europe/Prague", persona_type: "plant_based", cuisine_specialty: ["czech", "root_vegetables"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=anna&backgroundColor=fef5e5" },
  { name: "Hugo Silva", timezone: "Europe/Lisbon", persona_type: "fitness_enthusiast", cuisine_specialty: ["portuguese", "seafood"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=hugo&backgroundColor=e5f5fe" },
  { name: "Ingrid Hansen", timezone: "Europe/Copenhagen", persona_type: "wellness_coach", cuisine_specialty: ["danish", "hygge_foods"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ingrid&backgroundColor=f5fee5" },
  { name: "Pietro Bianchi", timezone: "Europe/Rome", persona_type: "nutritionist", cuisine_specialty: ["italian", "fresh_herbs"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=pietro&backgroundColor=fee5f5" },

  // Americas (15 bots)
  { name: "Maya Rodriguez", timezone: "America/Mexico_City", persona_type: "plant_based", cuisine_specialty: ["mexican", "beans"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya&backgroundColor=ffb3e6" },
  { name: "Jordan Smith", timezone: "America/New_York", persona_type: "fitness_enthusiast", cuisine_specialty: ["american", "protein_bowls"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan&backgroundColor=b3d9ff" },
  { name: "Isabella Santos", timezone: "America/Sao_Paulo", persona_type: "nutritionist", cuisine_specialty: ["brazilian", "tropical"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=isabella_santos&backgroundColor=d9ffb3" },
  { name: "Alex Johnson", timezone: "America/Chicago", persona_type: "busy_professional", cuisine_specialty: ["american", "meal_prep"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=ffb3d9" },
  { name: "Carmen Vargas", timezone: "America/Bogota", persona_type: "traditional_cuisine", cuisine_specialty: ["colombian", "quinoa"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=carmen&backgroundColor=b3ffb3" },
  { name: "Tyler Williams", timezone: "America/Los_Angeles", persona_type: "wellness_coach", cuisine_specialty: ["californian", "avocado"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=tyler&backgroundColor=ffb3b3" },
  { name: "Lucia Fernandez", timezone: "America/Buenos_Aires", persona_type: "plant_based", cuisine_specialty: ["argentinian", "grains"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=lucia&backgroundColor=b3b3ff" },
  { name: "Ryan Mitchell", timezone: "America/Denver", persona_type: "fitness_enthusiast", cuisine_specialty: ["american", "outdoor_nutrition"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ryan&backgroundColor=ffffb3" },
  { name: "Ana Gutierrez", timezone: "America/Lima", persona_type: "nutritionist", cuisine_specialty: ["peruvian", "superfoods"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana&backgroundColor=e6b3ff" },
  { name: "David Brown", timezone: "America/Toronto", persona_type: "busy_professional", cuisine_specialty: ["canadian", "maple"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=david&backgroundColor=b3e6ff" },
  { name: "Valentina Cruz", timezone: "America/Santiago", persona_type: "traditional_cuisine", cuisine_specialty: ["chilean", "seafood"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=valentina&backgroundColor=ffb3e6" },
  { name: "Ethan Davis", timezone: "America/Phoenix", persona_type: "wellness_coach", cuisine_specialty: ["southwestern", "desert_plants"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ethan&backgroundColor=ffd9b3" },
  { name: "Gabriela Lopez", timezone: "America/Guadalajara", persona_type: "plant_based", cuisine_specialty: ["mexican", "cactus"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=gabriela&backgroundColor=d9b3ff" },
  { name: "Marcus Thompson", timezone: "America/Atlanta", persona_type: "fitness_enthusiast", cuisine_specialty: ["southern", "plant_protein"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus&backgroundColor=b3ffd9" },
  { name: "Camila Silva", timezone: "America/Recife", persona_type: "nutritionist", cuisine_specialty: ["brazilian", "acai"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=camila&backgroundColor=ffb3d9" },

  // Australia/Oceania (5 bots)
  { name: "Emma Clarke", timezone: "Australia/Sydney", persona_type: "wellness_coach", cuisine_specialty: ["australian", "fresh_ingredients"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma&backgroundColor=b3ffff" },
  { name: "Liam Thompson", timezone: "Australia/Melbourne", persona_type: "fitness_enthusiast", cuisine_specialty: ["australian", "outdoor_cooking"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=liam&backgroundColor=ffb3ff" },
  { name: "Sophie Wang", timezone: "Australia/Perth", persona_type: "nutritionist", cuisine_specialty: ["fusion", "asian_australian"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=sophie&backgroundColor=ffffb3" },
  { name: "Jack Morrison", timezone: "Pacific/Auckland", persona_type: "plant_based", cuisine_specialty: ["new_zealand", "dairy_alternatives"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=jack&backgroundColor=b3e6ff" },
  { name: "Olivia Chen", timezone: "Australia/Brisbane", persona_type: "busy_professional", cuisine_specialty: ["tropical", "quick_healthy"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=olivia&backgroundColor=ffb3b3" },

  // Middle East/Africa (3 bots)
  { name: "Amara Hassan", timezone: "Africa/Cairo", persona_type: "traditional_cuisine", cuisine_specialty: ["middle_eastern", "legumes"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=amara&backgroundColor=e6ffb3" },
  { name: "Yuki Nakamura", timezone: "Asia/Tokyo", persona_type: "wellness_coach", cuisine_specialty: ["japanese", "fermented"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=yuki&backgroundColor=b3b3e6" },
  { name: "Omar Al-Rashid", timezone: "Asia/Dubai", persona_type: "nutritionist", cuisine_specialty: ["arabic", "dates"], profile_photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=omar&backgroundColor=e6e6b3" }
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Creating automation users...')

    const createdUsers = []

    for (const profile of botProfiles) {
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: `bot-${profile.name.toLowerCase().replace(/\s+/g, '-')}@yogiai.internal`,
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: {
          name: profile.name,
          bot_account: true
        }
      })

      if (authError) {
        console.error(`Failed to create auth user for ${profile.name}:`, authError)
        continue
      }

      console.log(`Created auth user for ${profile.name}`)

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authUser.user.id,
          name: profile.name,
          profile_photo_url: profile.profile_photo_url
        })

      if (profileError) {
        console.error(`Failed to create profile for ${profile.name}:`, profileError)
        continue
      }

      // Create automation user record
      const { error: automationError } = await supabase
        .from('automation_users')
        .insert({
          user_id: authUser.user.id,
          name: profile.name,
          profile_photo_url: profile.profile_photo_url,
          timezone: profile.timezone,
          persona_type: profile.persona_type,
          cuisine_specialty: profile.cuisine_specialty
        })

      if (automationError) {
        console.error(`Failed to create automation user for ${profile.name}:`, automationError)
        continue
      }

      createdUsers.push(profile.name)
      console.log(`Successfully created automation user: ${profile.name}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${createdUsers.length} automation users`,
        users: createdUsers
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error creating automation users:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})