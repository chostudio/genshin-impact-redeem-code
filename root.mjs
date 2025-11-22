export default async function runAutomation({ ai, secrets }) {
  console.log("🔍 Searching for active Genshin Impact codes...");
  
  const codeSourceUrl = "https://heartlog.github.io/Hoyocodes/"; 

  // --- STEP 1: GET CODES ---
  // FIX: Pass the prompt as a direct string, not an object.
  // We combine navigation and extraction into one clear instruction to ensure context is maintained.
  const extractionResult = await ai.evaluate(
    `Maps to ${codeSourceUrl} and wait for it to load.
     Look for the Genshin Impact codes section.
     Extract the codes (usually uppercase strings like 'GENSHINGIFT').
     
     OUTPUT RULES:
     - Return ONLY a valid JSON array of strings.
     - No markdown (no \`\`\`).
     - No conversational text.`
  );

  let codes = [];
  try {
    // Cleanup potential markdown just in case
    const cleanJson = extractionResult.replace(/```json|```/g, '').trim();
    codes = JSON.parse(cleanJson);
    console.log(`💎 Found ${codes.length} codes:`, codes);
  } catch (e) {
    console.error("❌ Failed to parse codes. Raw output was:", extractionResult);
    // Stop here if we didn't get codes
    return;
  }

  if (!codes.length) return;

  // --- STEP 2: LOGIN ---
  console.log("🔐 Logging in to Hoyoverse...");
  const redeemUrl = "https://genshin.hoyoverse.com/en/gift";

  // FIX: Assuming the signature is evaluate(promptString, optionsObject) for secrets
  await ai.evaluate(
    `Go to ${redeemUrl}.
     Check if I am logged in.
     If NOT logged in:
       1. Click login.
       2. Fill email with {{email}}.
       3. Fill password with {{password}}.
       4. Submit.
     Wait for the 'Redeem Code' page to load.`,
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
       4. Return the text of the result popup.`
    );

    console.log(`   ↳ Result: ${result}`);
    
    // Wait 5s to act human/avoid rate limits
    await new Promise(r => setTimeout(r, 5000));
  }
}