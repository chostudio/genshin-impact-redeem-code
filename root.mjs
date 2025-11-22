export default async function runAutomation({ ai, secrets }) {
  console.log("🔍 Searching for active Genshin Impact codes...");
  
  // 1. Get Codes
  const codeSourceUrl = "https://heartlog.github.io/Hoyocodes/"; // potential bottleneck if this site no longer works. IN that case, replace this with another code website. Or alter functionality for a broader (possibly less accurate) web search.

  const serverRegion = "Americas"; // replace this with Asia, Europe, etc.
  
  const extractionResult = await ai.evaluate({
    prompt: `Go to ${codeSourceUrl}. 
             Look for the section listing Genshin Impact codes.
             Extract ONLY the codes (strings like 'GENSHINGIFT', 'WT7D3...', etc).
             Return ONLY a JSON array of strings. Do not add markdown formatting or extra text.`,
  });

  let codes = [];
  try {
    const cleanJson = extractionResult.replace(/```json|```/g, '').trim();
    codes = JSON.parse(cleanJson);
    console.log(`💎 Found ${codes.length} codes:`, codes);
  } catch (e) {
    console.error("❌ Failed to parse codes:", extractionResult);
    return;
  }

  if (!codes.length) return;

  // 2. Login
  console.log("🔐 Logging in to Hoyoverse...");
  const redeemUrl = "https://genshin.hoyoverse.com/en/gift";

  await ai.evaluate({
    prompt: `Go to ${redeemUrl}.
             If not logged in:
             1. Click login.
             2. Fill email with secret value {{email}}.
             3. Fill password with secret value {{password}}.
             4. Submit and wait for the Redeem page to load.`,
    secrets: {
      email: secrets.email,
      password: secrets.password
    }
  });

  // 3. Redeem Loop
  console.log("🚀 Starting redemption loop...");

  for (const code of codes) {
    console.log(`🎁 Redeeming: ${code}`);
    
    const result = await ai.evaluate({
      prompt: `Ensure you are on ${redeemUrl}.
               1. Select the ${serverRegion} server.
               2. Enter code '${code}'.
               3. Click Redeem.
               4. Return the result text.`
    });

    console.log(`   ↳ Result: ${result}`);
    
    // Wait 10s
    await new Promise(r => setTimeout(r, 10000));
  }
}