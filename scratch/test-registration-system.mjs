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

const clientOrg = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const clientAtt = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testRegistrationSystem() {
  console.log("=== Testing Phase 6: Registration System, Capacity Trigger & Upsert ===");

  // Sign in Organizer
  const { data: authOrg } = await clientOrg.auth.signInWithPassword({
    email: "organizer@eventify.test",
    password: "Password123!",
  });
  console.log("✓ Organizer signed in:", authOrg.user.email);

  // Sign in Attendee
  const { data: authAtt } = await clientAtt.auth.signInWithPassword({
    email: "attendee@eventify.test",
    password: "Password123!",
  });
  console.log("✓ Attendee signed in:", authAtt.user.email);

  // 1. Organizer creates an exclusive 1-seat VIP workshop
  const { data: cats } = await clientOrg.from("categories").select("id").limit(1);
  const catId = cats[0].id;

  console.log("\n1. Organizer creating a strictly 1-capacity event...");
  const { data: event, error: createErr } = await clientOrg
    .from("events")
    .insert({
      organizer_id: authOrg.user.id,
      category_id: catId,
      title: "Exclusive 1-on-1 Mentorship Session",
      description: "A private 1-on-1 mentorship session with limited 1 seat capacity.",
      event_date: "2026-12-10",
      start_time: "15:00:00",
      end_time: "16:00:00",
      location: "Private Executive Suite",
      max_attendees: 1, // STRICTLY 1 SEAT
      status: "published",
    })
    .select()
    .single();

  if (createErr) throw createErr;
  console.log(`✓ Created event ID ${event.id} with max_attendees = 1`);

  // 2. Attendee registers for the event (Seat 1/1)
  console.log("\n2. Attendee registering for seat 1/1...");
  const { data: reg1, error: reg1Err } = await clientAtt
    .from("registrations")
    .upsert(
      {
        event_id: event.id,
        user_id: authAtt.user.id,
        status: "confirmed",
        registered_at: new Date().toISOString(),
      },
      { onConflict: "event_id,user_id" }
    )
    .select()
    .single();

  if (reg1Err) throw reg1Err;
  console.log(`✓ Attendee confirmed. Registration ID: ${reg1.id}, Status: ${reg1.status}`);

  // 3. Attendee calls register again (Duplicate registration test)
  console.log("\n3. Testing duplicate-registration prevention via upsert...");
  const { data: regDuplicate, error: dupErr } = await clientAtt
    .from("registrations")
    .upsert(
      {
        event_id: event.id,
        user_id: authAtt.user.id,
        status: "confirmed",
        registered_at: new Date().toISOString(),
      },
      { onConflict: "event_id,user_id" }
    )
    .select()
    .single();

  if (dupErr) throw dupErr;
  if (regDuplicate.id !== reg1.id) {
    throw new Error("Duplicate prevention failed: a new row was created instead of upserting!");
  }
  console.log("✓ SUCCESS: Duplicate registration cleanly upserted into identical row ID:", regDuplicate.id);

  // 4. Organizer attempts to register as second attendee -> Capacity enforcement trigger MUST reject!
  console.log("\n4. Testing capacity enforcement: User 2 attempts to register for already-full event...");
  const { data: regOverflow, error: overflowErr } = await clientOrg
    .from("registrations")
    .upsert(
      {
        event_id: event.id,
        user_id: authOrg.user.id,
        status: "confirmed",
        registered_at: new Date().toISOString(),
      },
      { onConflict: "event_id,user_id" }
    )
    .select()
    .single();

  if (!overflowErr) {
    throw new Error("CAPACITY ENFORCEMENT FAILED: Registration succeeded past capacity limit!");
  }
  console.log(`✓ SUCCESS: Postgres trigger rejected overflow registration! Message: "${overflowErr.message}"`);

  // 5. Attendee soft-cancels their registration
  console.log("\n5. Testing soft-cancel pattern...");
  const { data: cancelledReg, error: cancelErr } = await clientAtt
    .from("registrations")
    .update({ status: "cancelled" })
    .eq("event_id", event.id)
    .eq("user_id", authAtt.user.id)
    .select()
    .single();

  if (cancelErr) throw cancelErr;
  console.log(`✓ Attendee registration status updated to: "${cancelledReg.status}"`);

  // 6. Now User 2 registers for the freed seat
  console.log("\n6. User 2 registering now that seat is freed by cancellation...");
  const { data: regUser2, error: regUser2Err } = await clientOrg
    .from("registrations")
    .upsert(
      {
        event_id: event.id,
        user_id: authOrg.user.id,
        status: "confirmed",
        registered_at: new Date().toISOString(),
      },
      { onConflict: "event_id,user_id" }
    )
    .select()
    .single();

  if (regUser2Err) throw regUser2Err;
  console.log(`✓ User 2 successfully booked freed seat! Registration ID: ${regUser2.id}`);

  // 7. Attendee re-registers -> Should fail because User 2 has the 1 seat now!
  console.log("\n7. Attendee tries to re-register while User 2 holds the seat...");
  const { error: reRegErr } = await clientAtt
    .from("registrations")
    .upsert(
      {
        event_id: event.id,
        user_id: authAtt.user.id,
        status: "confirmed",
        registered_at: new Date().toISOString(),
      },
      { onConflict: "event_id,user_id" }
    )
    .select()
    .single();

  if (!reRegErr) {
    throw new Error("Trigger failed: attendee was able to re-register when event was full!");
  }
  console.log(`✓ SUCCESS: Postgres trigger rejected re-registration while full: "${reRegErr.message}"`);
  console.log(`✓ SUCCESS: Postgres trigger rejected re-registration while full: "${reRegErr.message}"`);

  // 8. Clean up
  console.log("\n8. Cleaning up test event...");
  await clientOrg.from("events").delete().eq("id", event.id);
  console.log("✓ Test event deleted.");

  console.log("\n🎉 ALL PHASE 6 REGISTRATION AND CAPACITY TRIGGER TESTS PASSED!");
}

testRegistrationSystem().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
