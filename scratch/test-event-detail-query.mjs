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

async function testDetailQuery() {
  const eventId = "b8a20271-e9df-4b2a-b352-1f7d7ed99e05";
  console.log("Querying event details for ID:", eventId);

  const { data, error } = await client
    .from("events")
    .select(`
      *,
      category:categories(id, name, icon),
      organizer:profiles(id, full_name, avatar_url, role),
      registrations(id, status, user_id)
    `)
    .eq("id", eventId)
    .single();

  console.log("Error:", error);
  console.log("Data title:", data?.title);
  console.log("Organizer:", data?.organizer);
}

testDetailQuery().catch(console.error);
