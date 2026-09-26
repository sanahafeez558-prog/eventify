import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
});

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testAutoConfirmSignup() {
  const testEmail = `student_${Date.now()}@gmail.com`;
  const password = "Password123!";

  console.log(`Testing signup for ${testEmail}...`);
  const { data: signUpData, error: signUpErr } = await client.auth.signUp({
    email: testEmail,
    password,
    options: {
      data: {
        full_name: "Demo Student",
      },
    },
  });

  if (signUpErr) throw signUpErr;
  console.log("✓ Signup completed. User ID:", signUpData.user?.id);

  // Attempt immediate login
  console.log("Attempting immediate sign in...");
  const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
    email: testEmail,
    password,
  });

  if (signInErr) throw signInErr;
  console.log("✓ Immediate sign in succeeded without waiting for email verification!");
  console.log("✓ Access Token exists:", !!signInData.session.access_token);

  // Check profile created
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", signInData.user.id)
    .single();

  console.log("✓ Profile record verified:", profile.full_name, profile.role);
}

testAutoConfirmSignup().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
