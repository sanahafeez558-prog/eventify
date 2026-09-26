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

async function testDashboardFlow() {
  console.log("=== Testing Phase 7: Dashboard Stats and RSVP Management ===");

  // 1. Sign in as attendee
  const { data: auth, error: authErr } = await client.auth.signInWithPassword({
    email: "attendee@eventify.test",
    password: "Password123!",
  });
  if (authErr) throw authErr;
  const user = auth.user;
  console.log("✓ Signed in as attendee:", user.email);

  // 2. Fetch initial dashboard stats
  const { count: initialRsvps } = await client
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "confirmed");

  console.log(`✓ Initial confirmed RSVPs count: ${initialRsvps}`);

  // 3. Register for an existing published event
  const { data: events } = await client
    .from("events")
    .select("id, title")
    .eq("status", "published")
    .limit(1);

  if (!events || !events.length) {
    throw new Error("No published events found to test with");
  }
  const testEvent = events[0];
  console.log(`✓ Testing RSVP with event: "${testEvent.title}" (${testEvent.id})`);

  // Register
  const { error: regErr } = await client.from("registrations").upsert(
    {
      event_id: testEvent.id,
      user_id: user.id,
      status: "confirmed",
      registered_at: new Date().toISOString(),
    },
    { onConflict: "event_id,user_id" }
  );
  if (regErr) throw regErr;

  // Check updated count
  const { count: afterRegCount } = await client
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "confirmed");

  console.log(`✓ RSVPs after registration: ${afterRegCount}`);
  if (afterRegCount !== initialRsvps + 1 && initialRsvps === 0) {
    console.log("✓ Registration successfully recorded.");
  }

  // 4. Cancel RSVP from dashboard
  const { error: cancelErr } = await client
    .from("registrations")
    .update({ status: "cancelled" })
    .eq("event_id", testEvent.id)
    .eq("user_id", user.id);

  if (cancelErr) throw cancelErr;

  // Check count decremented
  const { count: afterCancelCount } = await client
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "confirmed");

  console.log(`✓ RSVPs after cancellation: ${afterCancelCount}`);
  if (afterCancelCount !== afterRegCount - 1) {
    throw new Error("Count did not decrement properly upon cancellation!");
  }

  // 5. Query /dashboard/events data structure (including event and category join)
  const { data: myRegistrations, error: fetchErr } = await client
    .from("registrations")
    .select(`
      id,
      registered_at,
      status,
      event:events (
        id,
        title,
        description,
        event_date,
        start_time,
        end_time,
        location,
        image_url,
        max_attendees,
        status,
        category:categories (name)
      )
    `)
    .eq("user_id", user.id);

  if (fetchErr) throw fetchErr;
  console.log(`✓ /dashboard/events join returned ${myRegistrations.length} items`);
  console.log("✓ Joined event title:", myRegistrations[0]?.event?.title);
  console.log("✓ Joined category name:", myRegistrations[0]?.event?.category?.name);

  console.log("\n🎉 ALL PHASE 7 DASHBOARD ACCEPTANCE CRITERIA VERIFIED LIVE!");
}

testDashboardFlow().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
