export default async function runAutomation({ ai, secrets }) {
  console.log("🔍 Searching for active Genshin Impact codes...");
  
  const codeSourceUrl = "https://heartlog.github.io/Hoyocodes/"; 

  // --- STEP 1: GET CODES (This part works!) ---
  const extractionResult = await ai.evaluate(
    `Maps to ${codeSourceUrl} and wait for the list to load.
     List out the Genshin Impact codes found on the page.
     Return just the codes, one per line.`
  );

  let codes = [];
  
  // Use the working cleaning logic from previous attempt
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

  console.log("⏳ Waiting 5 seconds before login...");
  await new Promise(r => setTimeout(r, 5000));

  // --- STEP 2: LOGIN (FIXED) ---
  console.log("🔐 Logging in to Hoyoverse...");
  const redeemUrl = "https://genshin.hoyoverse.com/en/gift";

  // FIX: Using 'secretValues' based on your docs
  await ai.evaluate(
    `Go to ${redeemUrl}.
     Check if the user is already logged in (look for a logout button or profile name).
     
     If NOT logged in:
       1. Click the "Log In" button.
       2. In the email field, type the value associated with key 'email'.
       3. In the password field, type the value associated with key 'password'.
       4. Click the Submit/Login button.
     
     CRITICAL: If a CAPTCHA (puzzle piece) appears, pause and wait for the user to solve it, then verify you are logged in.`,
    {
      secretValues: {
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
    
    // We add a specific check to ensure the login persisted
    const result = await ai.evaluate(
      `Ensure you are on ${redeemUrl}.
       Check if you are still logged in. If not, stop and say "Logged out".
       
       1. Select server "${serverRegion}".
       2. Enter code "${code}".
       3. Click Redeem.
       4. Wait for the popup result.
       5. Return the text inside the popup.`
    );

    console.log(`   ↳ Result: ${result}`);
    
    if (result.includes("Logged out") || result.includes("Account Log In")) {
      console.log("⚠️ Login failed or session lost. Stopping.");
      break;
    }

    // Wait 5s between codes
    await new Promise(r => setTimeout(r, 5000));
  }
}