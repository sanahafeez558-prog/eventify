import { z } from "zod"

const usernameRegex = /^[A-Za-z]{4,22}$/
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/

const signupSchema = z.object({
  username: z
    .string()
    .min(4, "Username must be 4 to 22 characters")
    .max(22, "Username cannot exceed 22 characters")
    .regex(usernameRegex, "Username must contain ONLY alphabets (A-Z, a-z)"),
  email: z
    .string()
    .min(1, "Please enter valid Gmail with @")
    .refine((val) => val.includes("@"), {
      message: "Please enter valid Gmail with @",
    })
    .refine(
      (val) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(val.trim()),
      {
        message: "Please enter a valid Gmail address (e.g. yourname@gmail.com)",
      }
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      passwordRegex,
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special sign (!@#$%^&*)"
    ),
})

console.log("=== Testing Strict Auth Regex & Validation Rules ===")

// 1. Username
const validUsernames = ["Ayesha", "BilalKhan", "JohnDoe", "SaraAhmed"]
const invalidUsernames = ["Ali123", "User_Name", "A1", "WayTooLongOfAUsernameHereExceedingLimit", "has space"]

for (const u of validUsernames) {
  const res = signupSchema.shape.username.safeParse(u)
  if (!res.success) throw new Error(`Expected "${u}" to be valid`)
}
console.log("✅ Passed: Valid usernames (/^[A-Za-z]{4,22}$/) accepted.")

for (const u of invalidUsernames) {
  const res = signupSchema.shape.username.safeParse(u)
  if (res.success) throw new Error(`Expected "${u}" to be rejected`)
}
console.log("✅ Passed: Invalid usernames (numbers, symbols, spaces, wrong length) correctly rejected.")

// 2. Gmail
const validGmails = ["student@gmail.com", "ayesha.khan@gmail.com", "dev+test@gmail.com"]
const invalidGmails = ["invalid-email", "noatsign.com", "otherdomain@yahoo.com"]

for (const g of validGmails) {
  const res = signupSchema.shape.email.safeParse(g)
  if (!res.success) throw new Error(`Expected "${g}" to be valid`)
}
console.log("✅ Passed: Valid Gmail addresses accepted.")

for (const g of invalidGmails) {
  const res = signupSchema.shape.email.safeParse(g)
  if (res.success) throw new Error(`Expected "${g}" to be rejected`)
}
console.log("✅ Passed: Invalid Gmail patterns rejected with appropriate error.")

// 3. Password
const validPasswords = ["Password123!", "Eventify@2026", "Admin#999x", "Secure$1a"]
const invalidPasswords = [
  "nocapital123!",
  "NOLOWERCASE123!",
  "NoNumberHere!",
  "NoSpecialSign123",
  "Sh0rt!",
]

for (const p of validPasswords) {
  const res = signupSchema.shape.password.safeParse(p)
  if (!res.success) throw new Error(`Expected "${p}" to be valid`)
}
console.log("✅ Passed: Valid passwords meeting all 4 strict rules accepted.")

for (const p of invalidPasswords) {
  const res = signupSchema.shape.password.safeParse(p)
  if (res.success) throw new Error(`Expected "${p}" to be rejected`)
}
console.log("✅ Passed: Weak passwords missing any of the 4 strict requirements rejected.")

console.log("\n🎉 ALL STRICT VALIDATION TESTS PASSED 100%!")
