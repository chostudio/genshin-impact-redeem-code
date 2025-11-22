export default async function runAutomation({ ai, secrets }) {
  console.log("🔍 Searching for active Genshin Impact codes...");
  
  // --- STEP 1: GET CODES ---
  const codeSourceUrl = "https://heartlog.github.io/Hoyocodes/"; 

  // Fix: Navigate FIRST, then extract. 
  // This prevents the AI from trying to scrape a blank/loading page.
  await ai.evaluate({
    prompt: `Maps to ${codeSourceUrl}. Wait for the page to fully load.`
  });

  const extractionResult = await ai.evaluate({
    prompt: `Look at the page currently open. 
             Identify the active Genshin Impact redemption codes (usually uppercase strings like 'GENSHINGIFT' or alphanumeric sequences).
             
             Strict Output Rules:
             1. Return ONLY a valid JSON array of strings. 
             2. Do not output markdown code blocks (no \`\`\`).
             3. Do not output conversational text.
             
             Example output: ["GENSHINGIFT", "BSBE75C2299"]`
  });

  let codes = [];
  try {
    // Sanitize input just in case the AI ignores the "no markdown" rule
    const cleanJson = extractionResult.replace(/```json|```/g, '').trim();
    codes = JSON.parse(cleanJson);
    console.log(`💎 Found ${codes.length} codes:`, codes);
  } catch (e) {
    console.error("❌ Failed to parse codes. Raw output was:", extractionResult);
    return;
  }

  if (!codes.length) {
    console.log("⚠️ No codes found. Exiting.");
    return;
  }

  // --- STEP 2: LOGIN ---
  console.log("🔐 Logging in to Hoyoverse...");
  const redeemUrl = "https://genshin.hoyoverse.com/en/gift";

  await ai.evaluate({
    prompt: `Go to ${redeemUrl}.
             Check if the user is logged in.
             If NOT logged in:
               1. Click the login button.
               2. Fill the email field with: {{email}}.
               3. Fill the password field with: {{password}}.
               4. Submit the form.
             If a CAPTCHA appears, pause and wait for the user to solve it manually, then proceed.
             Ensure the "Redeem Code" page is visible before finishing.`,
    secrets: {
      email: secrets.email,
      password: secrets.password
    }
  });

  // --- STEP 3: REDEEM LOOP ---
  console.log("🚀 Starting redemption loop...");
  const serverRegion = "Americas"; 

  for (const code of codes) {
    console.log(`🎁 Redeeming: ${code}`);
    
    const result = await ai.evaluate({
      prompt: `You are on the redemption page.
               1. Click the Server selection and choose "${serverRegion}".
               2. Input the code "${code}" into the Redemption Code field.
               3. Click the Redeem button.
               4. Wait for the popup/modal response.
               5. Return the text inside the response popup.`
    });

    console.log(`   ↳ Result: ${result}`);
    
    // Wait 5s between requests to avoid rate limiting
    await new Promise(r => setTimeout(r, 5000));
  }
}