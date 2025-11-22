export default async function runAutomation({ ai, secrets }) {
  console.log("🔍 Searching for active Genshin Impact codes...");
  
  const codeSourceUrl = "https://heartlog.github.io/Hoyocodes/"; 

  // --- STEP 1: GET CODES ---
  const extractionResult = await ai.evaluate(
    `Maps to ${codeSourceUrl} and wait for the list to load.
     Extract the Genshin Impact codes (uppercase strings).
     
     OUTPUT REQUIREMENTS:
     1. Return ONLY a JSON array of strings.
     2. Use DOUBLE QUOTES for strings (e.g. ["CODE1", "CODE2"]).
     3. No markdown blocks.`
  );

  let codes = [];
  try {
    const cleanJson = extractionResult
      .replace(/```json|```/g, '') // Remove markdown
      .replace(/'/g, '"')          // FIX: Convert single quotes to double quotes
      .trim();
      
    codes = JSON.parse(cleanJson);
    console.log(`💎 Found ${codes.length} codes:`, codes);
  } catch (e) {
    console.error("❌ Failed to parse codes. Raw output was:", extractionResult);
    // Optional: manually define codes here if parsing fails repeatedly
    // codes = ["GENSHINGIFT"]; 
    return;
  }

  if (!codes.length) return;

  // --- STEP 2: LOGIN ---
  console.log("🔐 Logging in to Hoyoverse...");
  const redeemUrl = "https://genshin.hoyoverse.com/en/gift";

  await ai.evaluate(
    `Go to ${redeemUrl}.
     Check if I am logged in (look for a user profile or logout button).
     If NOT logged in:
       1. Click Login.
       2. Fill email with {{email}}.
       3. Fill password with {{password}}.
       4. Submit.
     Wait for the 'Redeem Code' page to be fully visible.`,
    {
      secrets: {
        email: secrets.email,
        password: secrets.password
      }
    }
  );

  // --- STEP 3: REDEEM LOOP ---
  console.log("🚀 Starting redemption loop...");
  const serverRegion = "Americas"; 

  for (const code of codes) {
    console.log(`🎁 Redeeming: ${code}`);
    
    const result = await ai.evaluate(
      `Ensure you are on ${redeemUrl}.
       1. Select server "${serverRegion}".
       2. Enter code "${code}".
       3. Click Redeem.
       4. Wait for the popup response.
       5. Return the text inside the popup.`
    );

    console.log(`   ↳ Result: ${result}`);
    
    // Wait 5s to avoid rate limiting
    await new Promise(r => setTimeout(r, 5000));
  }
}