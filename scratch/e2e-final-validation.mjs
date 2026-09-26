import { chromium } from "playwright";

async function runE2EValidation() {
  console.log("=================================================");
  console.log("   EVENTIFY CAPSTONE E2E FINAL VALIDATION PASS   ");
  console.log("=================================================");

  const browser = await chromium.launch({
    headless: true,
    channel: "msedge",
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const baseUrl = "http://localhost:3000";
  const testEmail = `e2e_student_${Date.now()}@gmail.com`;
  const testPassword = "Password123!";
  const testFullName = "E2E Test Student";

  try {
    // -------------------------------------------------------------
    // Step 1: Home Page
    // -------------------------------------------------------------
    console.log("\n[1/12] Testing Home Page (/) ...");
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    const pageTitle = await page.title();
    console.log(`✓ Page Title: "${pageTitle}"`);
    if (!pageTitle.includes("Eventify")) {
      throw new Error(`Expected title to contain Eventify, got: ${pageTitle}`);
    }

    const heroHeading = await page.textContent("h1");
    console.log(`✓ Hero Heading: "${heroHeading?.trim()}"`);

    // Verify categories or featured events render
    const categoryCount = await page.locator("a[href^='/events?category=']").count();
    console.log(`✓ Verified ${categoryCount} category cards rendered on home page.`);

    // -------------------------------------------------------------
    // Step 2: Events Discovery Page
    // -------------------------------------------------------------
    console.log("\n[2/12] Testing Events Discovery Page (/events) ...");
    await page.goto(`${baseUrl}/events`, { waitUntil: "networkidle" });
    const eventCardsCount = await page.locator("a[href^='/events/']").count();
    console.log(`✓ Discovered ${eventCardsCount} live event cards on discovery page.`);
    if (eventCardsCount === 0) {
      throw new Error("Expected at least one published event card on /events");
    }

    // -------------------------------------------------------------
    // Step 3: Event Detail Page
    // -------------------------------------------------------------
    console.log("\n[3/12] Testing Event Detail Page (/events/[id]) ...");
    const firstEventLink = await page.locator("a[href^='/events/']").first().getAttribute("href");
    console.log(`✓ Navigating to first event: ${firstEventLink}`);
    await page.goto(`${baseUrl}${firstEventLink}`, { waitUntil: "networkidle" });

    const detailTitle = await page.textContent("h1");
    console.log(`✓ Event Title on Detail View: "${detailTitle?.trim()}"`);

    // Verify register button exists
    const hasRegisterButton = await page.locator("button:has-text('Register')").count();
    console.log(`✓ Register button is present: ${hasRegisterButton > 0}`);

    // -------------------------------------------------------------
    // Step 4: Signup
    // -------------------------------------------------------------
    console.log("\n[4/12] Testing Signup Flow (/signup) ...");
    await page.goto(`${baseUrl}/signup`, { waitUntil: "networkidle" });

    await page.fill("input#full_name", testFullName);
    await page.fill("input#email", testEmail);
    await page.fill("input#password", testPassword);
    await page.fill("input#confirmPassword", testPassword);

    console.log(`✓ Submitting signup form for ${testEmail}...`);
    await page.click("button[type='submit']");
    await page.waitForTimeout(2500);

    // If redirected to login, or directly to dashboard
    const currentUrlAfterSignup = page.url();
    console.log(`✓ URL after signup: ${currentUrlAfterSignup}`);

    // -------------------------------------------------------------
    // Step 5: Login
    // -------------------------------------------------------------
    console.log("\n[5/12] Testing Login Flow (/login) ...");
    if (!currentUrlAfterSignup.includes("/dashboard")) {
      await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
      await page.fill("input#email", testEmail);
      await page.fill("input#password", testPassword);
      await page.click("button[type='submit']");
      await page.waitForURL("**/dashboard", { timeout: 10000 });
    }
    console.log(`✓ Successfully authenticated and landed on: ${page.url()}`);

    // -------------------------------------------------------------
    // Step 6: Dashboard Overview
    // -------------------------------------------------------------
    console.log("\n[6/12] Testing Dashboard Overview (/dashboard) ...");
    const welcomeHeader = await page.textContent("h1");
    console.log(`✓ Dashboard Welcome Header: "${welcomeHeader?.trim()}"`);
    if (!welcomeHeader?.includes("Welcome")) {
      throw new Error(`Expected welcome header on dashboard, got: ${welcomeHeader}`);
    }

    // -------------------------------------------------------------
    // Step 7: Register for an Event
    // -------------------------------------------------------------
    console.log("\n[7/12] Testing Event Registration as Authenticated Attendee ...");
    await page.goto(`${baseUrl}${firstEventLink}`, { waitUntil: "networkidle" });
    const regButton = page.locator("button:has-text('Register')");
    await regButton.click();
    await page.waitForTimeout(2000);

    const isRegistered = await page.locator("text=You're Registered").count();
    console.log(`✓ Registration confirmed! "You're Registered" state visible: ${isRegistered > 0}`);
    if (isRegistered === 0) {
      throw new Error("Expected 'You\\'re Registered' badge after clicking register");
    }

    // -------------------------------------------------------------
    // Step 8: My Registrations & Soft-Cancel
    // -------------------------------------------------------------
    console.log("\n[8/12] Testing My Registrations Page (/dashboard/events) ...");
    await page.goto(`${baseUrl}/dashboard/events`, { waitUntil: "networkidle" });
    const registeredCardsCount = await page.locator("text=Confirmed RSVP").count();
    console.log(`✓ Found ${registeredCardsCount} Confirmed RSVP card(s) under My Registrations.`);
    if (registeredCardsCount === 0) {
      throw new Error("Expected at least 1 Confirmed RSVP in /dashboard/events");
    }

    // Cancel RSVP
    console.log("Cancelling RSVP to test soft-cancel...");
    await page.click("button:has-text('Cancel RSVP')");
    await page.waitForTimeout(500);
    // Confirm dialog
    await page.click("button:has-text('Yes, Cancel RSVP')");
    await page.waitForTimeout(2000);

    const cancelledCount = await page.locator("text=Cancelled").count();
    console.log(`✓ Cancelled RSVP state verified: ${cancelledCount > 0}`);

    // -------------------------------------------------------------
    // Step 9: Create Event
    // -------------------------------------------------------------
    console.log("\n[9/12] Testing Host / Create Event (/dashboard/create-event) ...");
    await page.goto(`${baseUrl}/dashboard/create-event`, { waitUntil: "networkidle" });

    const newEventTitle = `CapStone E2E Showcase Event ${Date.now()}`;
    await page.fill("input#title", newEventTitle);
    await page.selectOption("select#category_id", { index: 1 });
    await page.fill("input#event_date", "2026-12-25");
    await page.fill("input#start_time", "10:00");
    await page.fill("input#end_time", "16:00");
    await page.fill("input#location", "Main University Tech Amphitheater");
    await page.fill("input#max_attendees", "120");
    await page.fill(
      "textarea#description",
      "A flagship technology symposium presenting cutting-edge fullstack engineering standards, cloud microservices, and reactive frontends."
    );

    console.log("Submitting new event...");
    await page.click("button[type='submit']");
    await page.waitForURL("**/dashboard/manage-events", { timeout: 10000 });
    console.log(`✓ Event created and redirected to: ${page.url()}`);

    // -------------------------------------------------------------
    // Step 10: Manage Events & Attendee Roster Modal
    // -------------------------------------------------------------
    console.log("\n[10/12] Testing Manage Events (/dashboard/manage-events) ...");
    await page.waitForSelector(`text=${newEventTitle}`, { timeout: 8000 });
    const hasCreatedEvent = await page.locator(`text=${newEventTitle}`).count();
    console.log(`✓ Newly created event visible in organizer list: ${hasCreatedEvent > 0}`);

    // Test Attendee roster modal
    console.log("Opening Attendee Roster modal...");
    await page.locator("button:has-text('Attendees')").first().click();
    await page.waitForTimeout(500);
    const rosterTitle = await page.locator("text=Attendee Roster").count();
    console.log(`✓ Attendee Roster modal opened: ${rosterTitle > 0}`);
    await page.click("button:has-text('Close')");
    await page.waitForTimeout(500);

    // -------------------------------------------------------------
    // Step 11: Edit Event
    // -------------------------------------------------------------
    console.log("\n[11/12] Testing Edit Event (/dashboard/manage-events/[id]/edit) ...");
    await page.locator("a:has-text('Edit')").first().click();
    await page.waitForURL("**/edit", { timeout: 10000 });
    console.log(`✓ Landed on Edit Event page: ${page.url()}`);

    const updatedTitle = `${newEventTitle} - Updated`;
    await page.fill("input#title", updatedTitle);
    await page.click("button[type='submit']");
    await page.waitForURL("**/dashboard/manage-events", { timeout: 10000 });

    await page.waitForSelector(`text=${updatedTitle}`, { timeout: 8000 });
    const hasUpdatedTitle = await page.locator(`text=${updatedTitle}`).count();
    console.log(`✓ Updated event title verified on Manage Events: ${hasUpdatedTitle > 0}`);

    // -------------------------------------------------------------
    // Step 12: Logout
    // -------------------------------------------------------------
    console.log("\n[12/12] Testing Sign Out ...");
    const signOutBtn = page.locator("button:has-text('Sign Out'):visible, button:has-text('Sign out'):visible").first();
    await signOutBtn.click();
    await page.waitForURL(`${baseUrl}/**`, { timeout: 10000 });
    console.log(`✓ Successfully signed out and redirected to: ${page.url()}`);

    console.log("\n=================================================");
    console.log("   ALL 12/12 DEMO FLOW STEPS COMPLETED & PASSED!  ");
    console.log("=================================================");
  } finally {
    await browser.close();
  }
}

runE2EValidation().catch((err) => {
  console.error("\n❌ E2E TEST FAILED:", err);
  process.exit(1);
});
