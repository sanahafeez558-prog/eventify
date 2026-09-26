import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

async function run() {
  console.log("=== Testing Phase 5: Event System & RLS Enforcement ===");

  // Create two distinct client sessions
  const clientA = createClient(url, anonKey);
  const clientB = createClient(url, anonKey);

  const emailA = `eventify.test.a.${Date.now()}@gmail.com`;
  const emailB = `eventify.test.b.${Date.now()}@gmail.com`;
  const password = "Password123!";

  console.log(`1. Creating User A (${emailA}) and User B (${emailB})...`);
  const { data: authA, error: errA } = await clientA.auth.signUp({
    email: emailA,
    password,
    options: { data: { full_name: "User Alpha" } },
  });
  if (errA) throw new Error(`User A signup failed: ${errA.message}`);

  const { data: authB, error: errB } = await clientB.auth.signUp({
    email: emailB,
    password,
    options: { data: { full_name: "User Beta" } },
  });
  if (errB) throw new Error(`User B signup failed: ${errB.message}`);

  const userA = authA.user;
  const userB = authB.user;
  console.log(`✓ User A ID: ${userA.id}`);
  console.log(`✓ User B ID: ${userB.id}`);

  // Fetch a category to use
  const { data: cats, error: catErr } = await clientA.from("categories").select("id").limit(1);
  if (catErr || !cats.length) throw new Error("No categories found");
  const categoryId = cats[0].id;

  // 2. User A creates an event
  console.log("\n2. User A creates an event...");
  const { data: newEvent, error: createErr } = await clientA
    .from("events")
    .insert({
      organizer_id: userA.id,
      category_id: categoryId,
      title: "Alpha Tech Symposium 2026",
      description: "An exclusive tech symposium organized by User Alpha.",
      event_date: "2026-11-15",
      start_time: "09:00:00",
      end_time: "17:00:00",
      location: "San Francisco Innovation Hub",
      max_attendees: 100,
      status: "published",
    })
    .select()
    .single();

  if (createErr) throw new Error(`User A create failed: ${createErr.message}`);
  console.log(`✓ Event created successfully with ID: ${newEvent.id}`);

  // 3. User A updates their own event
  console.log("\n3. User A updates their own event title...");
  const { data: updatedEvent, error: updateErr } = await clientA
    .from("events")
    .update({ title: "Alpha Tech Symposium 2026 - Updated" })
    .eq("id", newEvent.id)
    .select()
    .single();

  if (updateErr) throw new Error(`User A update failed: ${updateErr.message}`);
  console.log(`✓ Event updated by User A. New title: "${updatedEvent.title}"`);

  // 4. User B attempts to UPDATE User A's event (MUST BE REJECTED by RLS)
  console.log("\n4. User B attempts to hijack and update User A's event...");
  const { data: hijackedData, error: hijackErr } = await clientB
    .from("events")
    .update({ title: "Hacked by User Beta" })
    .eq("id", newEvent.id)
    .select();

  if (hijackedData && hijackedData.length > 0) {
    console.error("CRITICAL FAILURE: User B was able to modify User A's event!");
    process.exit(1);
  } else {
    console.log("✓ SUCCESS: User B's update was rejected by RLS (0 rows updated).");
  }

  // 5. User B attempts to DELETE User A's event (MUST BE REJECTED by RLS)
  console.log("\n5. User B attempts to delete User A's event...");
  const { data: deletedByB, error: deleteByBErr } = await clientB
    .from("events")
    .delete()
    .eq("id", newEvent.id)
    .select();

  if (deletedByB && deletedByB.length > 0) {
    console.error("CRITICAL FAILURE: User B was able to delete User A's event!");
    process.exit(1);
  } else {
    console.log("✓ SUCCESS: User B's delete was rejected by RLS (0 rows deleted).");
  }

  // 6. User A deletes their own event
  console.log("\n6. User A deletes their own event...");
  const { error: deleteErr } = await clientA
    .from("events")
    .delete()
    .eq("id", newEvent.id);

  if (deleteErr) throw new Error(`User A delete failed: ${deleteErr.message}`);
  console.log("✓ Event deleted successfully by owner User A.");

  console.log("\n🎉 ALL PHASE 5 ACCEPTANCE TESTS PASSED VERIFIED LIVE AGAINST RLS!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
