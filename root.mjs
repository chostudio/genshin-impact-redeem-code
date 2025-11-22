export default async function runAutomation({ ai, secrets }) {
  console.log("🔍 Searching for active Genshin Impact codes...");
  
  const codeSourceUrl = "https://heartlog.github.io/Hoyocodes/"; 

  // --- STEP 1: GET CODES ---
  const extractionResult = await ai.evaluate(
    `Maps to ${codeSourceUrl} and wait for the list to load.
     List out the Genshin Impact codes found on the page.
     Return just the codes, one per line.`
  );

  let codes = [];
  
  // FIX: Universal Parser
  // 1. Split by newline (handles lists)
  // 2. Remove non-alphanumeric chars (removes "- ", quotes, brackets)
  // 3. Filter out empty lines or short noise
  codes = extractionResult
    .split('\n')
    .map(line => line.replace(/[^a-zA-Z0-9]/g, '').trim())
    .filter(line => line.length > 5); 

  if (codes.length > 0) {
    console.log(`💎 Found ${codes.length} codes:`, codes);
  } else {
    console.error("❌ No codes found. Raw output:", extractionResult);
    return;
  }

  // FIX: The "Wait" you requested
  console.log("⏳ Waiting 5 seconds before starting login sequence...");
  await new Promise(r => setTimeout(r, 5000));

  // --- STEP 2: LOGIN ---
  console.log("🔐 Logging in to Hoyoverse...");
  const redeemUrl = "https://genshin.hoyoverse.com/en/gift";

  await ai.evaluate(
    `Go to ${redeemUrl}.
     Check if I am logged in (look for user profile or logout button).
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