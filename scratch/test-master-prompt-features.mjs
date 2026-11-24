import { signupSchema, loginSchema } from "../lib/validations/auth.js"

console.log("=== Testing Strict Auth Regex & Validation Rules ===")

// Test 1: Username Validation
const validUsernames = ["Ayesha", "BilalKhan", "JohnDoe", "SaraAhmed"]
const invalidUsernames = ["Ali123", "User_Name", "A1", "WayTooLongOfAUsernameHereExceedingLimit", "has space"]

for (const u of validUsernames) {
  const res = signupSchema.shape.username.safeParse(u)
  if (!res.success) {
    console.error(`❌ Expected username "${u}" to be valid, but failed:`, res.error.issues)
    process.exit(1)
  }
}
console.log("✅ Passed: Valid usernames (/^[A-Za-z]{4,22}$/) accepted.")

for (const u of invalidUsernames) {
  const res = signupSchema.shape.username.safeParse(u)
  if (res.success) {
    console.error(`❌ Expected username "${u}" to be rejected, but it passed!`)
    process.exit(1)
  }
}
console.log("✅ Passed: Invalid usernames (numbers, symbols, spaces, wrong length) correctly rejected.")

// Test 2: Gmail Validation
const validGmails = ["student@gmail.com", "ayesha.khan@gmail.com", "dev+test@gmail.com"]
const invalidGmails = ["invalid-email", "noatsign.com", "otherdomain@yahoo.com"]

for (const g of validGmails) {
  const res = signupSchema.shape.email.safeParse(g)
  if (!res.success) {
    console.error(`❌ Expected Gmail "${g}" to be valid, but failed:`, res.error.issues)
    process.exit(1)
  }
}
console.log("✅ Passed: Valid Gmail addresses accepted.")

for (const g of invalidGmails) {
  const res = signupSchema.shape.email.safeParse(g)
  if (res.success) {
    console.error(`❌ Expected email "${g}" to be rejected, but it passed!`)
    process.exit(1)
  }
}
console.log("✅ Passed: Invalid Gmail patterns rejected with appropriate error.")

// Test 3: Password 4-rule Regex
// Must contain: 1 capital, 1 small, 1 number, 1 special (!@#$%^&*), min 8 chars
const validPasswords = ["Password123!", "Eventify@2026", "Admin#999x", "Secure$1a"]
const invalidPasswords = [
  "nocapital123!",  // no capital
  "NOLOWERCASE123!", // no lowercase
  "NoNumberHere!",   // no number
  "NoSpecialSign123", // no special sign
  "Sh0rt!",          // less than 8 chars
]

for (const p of validPasswords) {
  const res = signupSchema.shape.password.safeParse(p)
  if (!res.success) {
    console.error(`❌ Expected password "${p}" to be valid, but failed:`, res.error.issues)
    process.exit(1)
  }
}
console.log("✅ Passed: Valid passwords meeting all 4 strict rules accepted.")

for (const p of invalidPasswords) {
  const res = signupSchema.shape.password.safeParse(p)
  if (res.success) {
    console.error(`❌ Expected password "${p}" to be rejected, but it passed!`)
    process.exit(1)
  }
}
console.log("✅ Passed: Weak passwords missing any of the 4 strict requirements rejected.")

console.log("\n🎉 ALL STRICT VALIDATION TESTS PASSED 100%!")
