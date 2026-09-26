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

const clientA = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const clientB = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testFullFlow() {
  console.log("1. Signing in as Organizer...");
  const { data: authA, error: errA } = await clientA.auth.signInWithPassword({
    email: "organizer@eventify.test",
    password: "Password123!",
  });
  if (errA) throw errA;
  console.log("✓ Organizer signed in:", authA.user.email);

  console.log("\n2. Signing in as Attendee...");
  const { data: authB, error: errB } = await clientB.auth.signInWithPassword({
    email: "attendee@eventify.test",
    password: "Password123!",
  });
  if (errB) throw errB;
  console.log("✓ Attendee signed in:", authB.user.email);

  // Organizer creates an event
  const { data: cats } = await clientA.from("categories").select("id").limit(1);
  const catId = cats[0].id;

  console.log("\n3. Organizer creating an event...");
  const { data: event, error: createErr } = await clientA
    .from("events")
    .insert({
      organizer_id: authA.user.id,
      category_id: catId,
      title: "Fullstack Architecture Workshop 2026",
      description: "Learn fullstack architecture with Next.js and Supabase.",
      event_date: "2026-12-01",
      start_time: "14:00:00",
      end_time: "18:00:00",
      location: "Virtual Stage 1",
      max_attendees: 50,
      status: "published",
    })
    .select()
    .single();

  if (createErr) throw createErr;
  console.log("✓ Event created with ID:", event.id);

  // Organizer updates their own event
  console.log("\n4. Organizer updating event title...");
  const { data: updated, error: updateErr } = await clientA
    .from("events")
    .update({ title: "Fullstack Architecture Masterclass 2026" })
    .eq("id", event.id)
    .select()
    .single();

  if (updateErr) throw updateErr;
  console.log("✓ Event title updated to:", updated.title);

  // Attendee attempts to UPDATE Organizer's event (MUST FAIL RLS)
  console.log("\n5. Attendee attempting to update Organizer's event...");
  const { data: hacked, error: hackErr } = await clientB
    .from("events")
    .update({ title: "Hacked by Attendee" })
    .eq("id", event.id)
    .select();

  if (hacked && hacked.length > 0) {
    throw new Error("SECURITY BREACH: Attendee was able to update organizer's event!");
  }
  console.log("✓ RLS ENFORCED: Attendee update returned 0 rows (rejected).");

  // Attendee attempts to DELETE Organizer's event (MUST FAIL RLS)
  console.log("\n6. Attendee attempting to delete Organizer's event...");
  const { data: deleted, error: delErr } = await clientB
    .from("events")
    .delete()
    .eq("id", event.id)
    .select();

  if (deleted && deleted.length > 0) {
    throw new Error("SECURITY BREACH: Attendee was able to delete organizer's event!");
  }
  console.log("✓ RLS ENFORCED: Attendee delete returned 0 rows (rejected).");

  // Organizer deletes the event
  console.log("\n7. Organizer deleting their own event...");
  const { error: finalDelErr } = await clientA
    .from("events")
    .delete()
    .eq("id", event.id);

  if (finalDelErr) throw finalDelErr;
  console.log("✓ Event cleanly deleted by its organizer.");

  console.log("\n🎉 ALL PHASE 5 ACCEPTANCE CRITERIA VERIFIED VIA REAL CLIENT SESSIONS!");
}

testFullFlow().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
