import 'dotenv/config'
import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const sessionId = process.argv[2]
if (!sessionId) {
  console.error('❌ No sessionId provided to runner')
  process.exit(1)
}

const apiKey = process.env.ANCHOR_BROWSER_KEY
if (!apiKey) {
  console.error('❌ Missing ANCHOR_BROWSER_KEY in .env file')
  process.exit(1)
}

// Secrets for the AI agent
const genshinSecrets = {
  email: process.env.GENSHIN_EMAIL,
  password: process.env.GENSHIN_PASSWORD
}

const connectionString = `wss://connect.anchorbrowser.io?apiKey=${apiKey}&sessionId=${sessionId}`

console.log('🔗 Connecting to Anchor Browser session:', sessionId)

try {
  const browser = await chromium.connectOverCDP(connectionString)
  console.log('✅ Connected to Anchor Browser')

  const context = browser.contexts()[0]
  const ai = context.serviceWorkers()[0]

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const scriptPath = path.resolve(__dirname, './daily-login.mjs')

  console.log('🚀 Running daily login script from:', scriptPath)

  const { default: runAutomation } = await import(scriptPath)

  await runAutomation({
    ai,
    secrets: genshinSecrets
  })

  console.log('🎉 Done! Closing browser...')
  await browser.close()
} catch (err) {
  console.error('❌ Connection or runtime error:', err)
  process.exit(1)
}
