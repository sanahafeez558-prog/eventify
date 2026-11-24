import fs from "fs"

const envFile = fs.readFileSync(".env.local", "utf8")
const env = {}
envFile.split("\n").forEach((line) => {
  const parts = line.split("=")
  if (parts.length >= 2) {
    const k = parts[0].trim()
    const v = parts.slice(1).join("=").trim()
    env[k] = v
  }
})

const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`
const apiKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testLogin(email, password) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": apiKey,
    },
    body: JSON.stringify({ email, password }),
  })

  const result = await response.json()
  if (response.ok) {
    console.log(`✅ VERIFIED: ${email} with password "${password}" logged in successfully!`)
  } else {
    console.error(`❌ FAILED for ${email}:`, result.error_description || result.msg || result)
  }
}

async function run() {
  await testLogin("admin@eventify.com", "Admin123!")
  await testLogin("sanahafeez558@gmail.com", "Admin123!")
}

run()
