export default async function runAutomation({ ai, secrets }) {
  const dailyLoginUrl =
    "https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481";

  console.log("📅 Navigating to Hoyolab Daily Login...");

  await ai.evaluate(
    `Go to ${dailyLoginUrl} and wait for the page to fully load.`
  );

  console.log("🔐 Performing login...");

  await ai.evaluate(
    `Log the user in if not already logged in:
       1. If you see a "Log In" or "Login" button, click it.
       2. Wait for the login modal or form to appear.
       3. Fill the email/username field with "${secrets.email}"
       4. Fill the password field with "${secrets.password}"
       5. Click the submit/login button.
     
     Wait 3 seconds for login to complete. If already logged in, do nothing and wait 2 seconds.`
  );

  console.log("🎁 Claiming daily login reward...");

  const result = await ai.evaluate(
    `On the daily sign-in / check-in page:
       1. Find the "Sign In" or "Check In" or "Claim" button for today's reward (often the current day or a highlighted day).
       2. If today is already claimed, look for a message like "Already claimed" or similar and return that.
       3. Otherwise click the button to claim the daily reward.
       4. Wait for any confirmation (popup or message).
       5. Return a short summary: either "Claimed successfully" or "Already claimed" or the confirmation text you see.`
  );

  console.log("   ↳ Result:", result || "(no message)");
  console.log("✅ Daily login automation finished.");
}
