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
  codes = extractionResult
    .split('\n')
    .map(line => line.replace(/[^a-zA-Z0-9]/g, '').trim())
    .filter(line => line.length > 5); 

  if (codes.length > 0) {
    console.log(`💎 Found ${codes.length} codes:`, codes);
  } else {
    console.error("❌ No codes found.");
    return;
  }

  // --- STEP 2: PREPARE FOR LOGIN ---
  console.log("🚀 Navigating to Redeem Page...");
   // FIX: Explicit Navigation Step (else, there's a chance it would go to hoyoverse lab which is not the correct page)
  // We navigate FIRST, before we try to interact with secrets.
  const redeemUrl = "https://genshin.hoyoverse.com/en/gift";
  await ai.evaluate(`Maps to ${redeemUrl} and wait for the page to fully load.`);



  console.log("🔐 performing Login...");

  // FIX: Secrets Structure & Scope
  // 1. Removed "Go to URL" from this prompt (since we are already there).
  // 2. Used 'taskOptions' nesting based on your docs.
  await ai.evaluate(
    `Log the user in:
       1. Click the "Log In" button (top right).
       2. Wait for the login modal/form to appear.
       3. Fill the email field with {{HOYOVERSE_EMAIL}}
       4. Fill the password field with {{HOYOVERSE_PASSWORD}}
       5. Click the Login button.
     
     Wait 5 seconds to ensure login completes.`,
    {
      taskOptions: {
        url: redeemUrl,
        secretValues: {
          HOYOVERSE_EMAIL: secrets.email,
          HOYOVERSE_PASSWORD: secrets.password
        }
      }
    }
  );

  // --- STEP 3: REDEEM LOOP ---
  console.log("🚀 Starting redemption loop...");
  const serverRegion = "Americas"; 

  for (const code of codes) {
    console.log(`🎁 Redeeming: ${code}`);
    
    const result = await ai.evaluate(
      `Ensure you are on the redeem page (${redeemUrl}).
       If a login popup is blocking the screen, close it or log in again.

       1. Select server "${serverRegion}".
       2. Enter code "${code}".
       3. Click Redeem.
       4. Wait for the popup result.
       5. Return the text inside the popup.`
    );

    console.log(`   ↳ Result: ${result}`);
    
    // Check for logout again
    if (result.includes("Log In") || result.includes("logged out")) {
      console.error("⚠️ Session lost. Stopping.");
      break;
    }

    await new Promise(r => setTimeout(r, 5000));
  }
}