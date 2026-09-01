import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("loads the campaign hub and shows the fetched scenario", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Choose your campaign" })).toBeVisible();
  // The fallback shell also renders an <h1>"Brass Ledger" and a usable start button while
  // /api/scenario is loading (or if it fails), so assert scenario-only content to prove the
  // fetch actually succeeded rather than the loading/error fallback.
  await expect(page.getByText("rebuild a credible defense during a slow-burning crisis")).toBeVisible();
  await expect(page.getByText("rebuild a credible defense during a slow-burning crisis")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Start new campaign" })).toBeVisible();
});

test("create, play, and record a full campaign month", async ({ page }) => {
  await page.goto("/");

  await test.step("create a new campaign", async () => {
    await page.getByRole("button", { name: "Start new campaign" }).click();
    await expect(page.getByRole("button", { name: "Open decision memos →" })).toBeVisible();
    await expect(page.getByText("First time here — The campaign has a horizon")).toBeVisible();
    await expect(page.getByText("First time here — A programme is not useful all at once")).toBeVisible();
    const compactView = page.getByRole("button", { name: "Compact view" });
    await expect(compactView).toHaveAttribute("aria-pressed", "false");
    await compactView.click();
    await expect(page.getByRole("button", { name: "Standard view" })).toHaveAttribute("aria-pressed", "true");
    // Compact presentation may collapse repeated reporting, but it never
    // removes a decision control or changes the authoritative campaign flow.
    await expect(page.getByRole("button", { name: "Open decision memos →" })).toBeVisible();
  });

  await test.step("resume the campaign from the hub", async () => {
    await page.getByRole("button", { name: "BRASS LEDGER" }).click();
    const row = page.locator("table tbody tr").first();
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "Open" }).click();
    await expect(page.getByRole("button", { name: "Open decision memos →" })).toBeVisible();
  });

  await test.step("choose an option for every required memo", async () => {
    await page.getByRole("button", { name: "Open decision memos →" }).click();
    const requiredMemos = page.locator('fieldset:has(input[type="radio"])');
    const memoCount = await requiredMemos.count();
    expect(memoCount).toBeGreaterThan(0);
    for (let i = 0; i < memoCount; i++) {
      await requiredMemos.nth(i).locator('input[type="radio"]').first().check();
    }
    await expect(page.getByRole("button", { name: "Hear from the chiefs →" })).toBeEnabled();
  });

  await test.step("hear from the chiefs and talk to one", async () => {
    await page.getByRole("button", { name: "Hear from the chiefs →" }).click();
    const talkButton = page.getByRole("button", { name: /^Talk to / }).first();
    await expect(talkButton).toBeVisible();
    await talkButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const replyButtons = dialog.locator('button:not([aria-label="Close conversation"])');
    await expect(replyButtons.first()).toBeVisible();
    const replacementPreview = page.waitForResponse((r) => r.url().includes("/preview-turn") && r.request().method() === "POST");
    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/respond") && r.request().method() === "POST"),
      replyButtons.first().click(),
    ]);
    expect(response.ok()).toBeTruthy();
    expect((await replacementPreview).ok()).toBeTruthy();
    await dialog.getByRole("button", { name: "Close conversation" }).click();
    await expect(dialog).not.toBeVisible();

    await page.getByRole("button", { name: "Continue to final review →" }).click();
  });

  await test.step("block a chief conversation detached from the final packet", async () => {
    // A completed conversation is authoritative and bound to the option that
    // was discussed. Changing that memo locally must not let the player commit
    // a different option while retaining its trust/commitment effects.
    await page.getByRole("button", { name: "← Back to chiefs" }).click();
    await page.getByRole("button", { name: "← Back to memos" }).click();
    const firstMemoOptions = page.locator('fieldset:has(input[type="radio"])').first().locator('input[type="radio"]');
    expect(await firstMemoOptions.count()).toBeGreaterThan(1);
    const replacementPreview = page.waitForResponse((response) => response.url().includes("/preview-turn") && response.request().method() === "POST");
    await firstMemoOptions.nth(1).check();
    expect((await replacementPreview).ok()).toBeTruthy();
    await expect(page.getByRole("button", { name: "Hear from the chiefs →" })).toBeEnabled();
    await page.getByRole("button", { name: "Hear from the chiefs →" }).click();
    await page.getByRole("button", { name: "Continue to final review →" }).click();

    const conflictRiskCheckboxes = page.locator('div.border.border-border.p-4', { hasText: "Staff risk warnings" }).locator('input[type="checkbox"]');
    for (let index = 0; index < await conflictRiskCheckboxes.count(); index++) {
      await conflictRiskCheckboxes.nth(index).check();
    }
    const commitButton = page.getByRole("button", { name: "Commit the month" });
    await expect(commitButton).toBeDisabled();
    await expect(page.getByText("You cannot commit while a recorded chief conversation conflicts with this packet.")).toBeVisible();

    // The blocker provides the exact discussed option as an explicit route;
    // clicking it is still the commander's deliberate selection, never an
    // automatic reconciliation.
    const restoredPreview = page.waitForResponse((response) => response.url().includes("/preview-turn") && response.request().method() === "POST");
    await page.getByRole("button", { name: "Restore that discussed option and return to chiefs" }).click();
    expect((await restoredPreview).ok()).toBeTruthy();
    await expect(page.getByRole("button", { name: "Continue to final review →" })).toBeVisible();
    await page.getByRole("button", { name: "Continue to final review →" }).click();
    await expect(page.getByText("You cannot commit while a recorded chief conversation conflicts with this packet.")).not.toBeVisible();
  });

  await test.step("accept any staff warnings and commit the month", async () => {
    const riskSection = page.locator("div.border.border-border.p-4", { hasText: "Staff risk warnings" });
    const riskCheckboxes = riskSection.locator('input[type="checkbox"]');
    const riskCount = await riskCheckboxes.count();
    for (let i = 0; i < riskCount; i++) {
      await riskCheckboxes.nth(i).check();
    }

    const commitButton = page.getByRole("button", { name: "Commit the month" });
    await expect(commitButton).toBeEnabled();
    await commitButton.click();
    await expect(page.getByRole("button", { name: "Go to records" })).toBeVisible();
  });

  await test.step("reopen an active campaign at the next monthly brief", async () => {
    await page.getByRole("button", { name: "BRASS LEDGER" }).click();
    const row = page.locator("table tbody tr").first();
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "Open" }).click();
    await expect(page.getByRole("heading", { name: /^Month 2 of / })).toBeVisible();
  });

  await test.step("visit records and export the campaign", async () => {
    await page.getByRole("button", { name: "Records" }).click();
    await expect(page.getByRole("heading", { name: "Campaign records" })).toBeVisible();

    const row = page.locator("table tbody tr").first();
    await expect(row).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      row.getByRole("button", { name: "Save to file" }).click(),
    ]);
    const exportPath = await download.path();
    expect(exportPath).toBeTruthy();
    const exported = JSON.parse(readFileSync(exportPath!, "utf8"));
    expect(exported.session).toBeTruthy();
    expect(exported.session.history.length).toBeGreaterThan(0);
    const originalIdPrefix = (exported.session.id as string).slice(0, 12);
    const originalRow = page.locator("table tbody tr", { hasText: originalIdPrefix });

    await test.step("bring the exported file back in as a new campaign", async () => {
      const beforeCount = await page.locator("table tbody tr").count();
      await page.getByLabel("Choose a saved campaign file to bring in").setInputFiles(exportPath!);
      await expect(page.locator("table tbody tr")).toHaveCount(beforeCount + 1);
    });

    await test.step("check the replay of the original campaign", async () => {
      await originalRow.getByRole("button", { name: "Check replay" }).click();
      await expect(originalRow.getByText(/verified/)).toBeVisible();
    });
  });
});

test("Staff Exercise resolves through the normal save and replay path", async ({ page }) => {
  await page.goto("/");

  // The training exercise is an authored scenario, not a client-side tutorial
  // route. Start it from the same hub and resolve its opening packet through
  // the ordinary server-owned turn path.
  await page.getByRole("button", { name: /Staff Exercise/ }).click();
  await page.getByRole("button", { name: "Start new campaign" }).click();
  await expect(page.getByRole("heading", { name: /^Month 1 of 4/ })).toBeVisible();

  for (let month = 1; month <= 4; month++) {
    await page.getByRole("button", { name: "Open decision memos →" }).click();
    const memos = page.locator('fieldset:has(input[type="radio"])');
    if (month === 1) await expect(memos).toHaveCount(2);
    expect(await memos.count()).toBeGreaterThan(0);
    for (let index = 0; index < await memos.count(); index++) {
      await memos.nth(index).locator('input[type="radio"]').first().check();
    }
    await expect(page.getByRole("button", { name: "Hear from the chiefs →" })).toBeEnabled();
    await page.getByRole("button", { name: "Hear from the chiefs →" }).click();
    await page.getByRole("button", { name: "Continue to final review →" }).click();

    const risks = page.locator('div.border.border-border.p-4', { hasText: "Staff risk warnings" }).locator('input[type="checkbox"]');
    for (let index = 0; index < await risks.count(); index++) {
      await risks.nth(index).check();
    }
    await expect(page.getByRole("button", { name: "Commit the month" })).toBeEnabled();
    await page.getByRole("button", { name: "Commit the month" }).click();

    if (month < 4) {
      await expect(page.getByText(`What happened in month ${month}`)).toBeVisible();
      await page.getByRole("button", { name: "Start next month →" }).click();
      await expect(page.getByRole("heading", { name: new RegExp(`^Month ${month + 1} of 4`) })).toBeVisible();
    }
  }
  await expect(page.getByRole("heading", { name: /Campaign (won|lost)/ })).toBeVisible();

  await page.getByRole("button", { name: "Go to records" }).click();
  // The persisted display name is the authored opening-brief title, while the
  // scenario identity remains in the save itself. This isolated E2E store has
  // exactly the exercise session we just resolved.
  const exerciseRow = page.locator("table tbody tr").first();
  await expect(exerciseRow).toBeVisible();
  await exerciseRow.getByRole("button", { name: "Check replay" }).click();
  await expect(exerciseRow.getByText(/verified/)).toBeVisible();
});

test("memo choices reflow on a narrow screen without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /Staff Exercise/ }).click();
  await page.getByRole("button", { name: "Start new campaign" }).click();
  await page.getByRole("button", { name: "Open decision memos →" }).click();

  expect(await page.locator("main").evaluate((element) => element.scrollTop)).toBe(0);
  await expect(page.getByText("Staff workload if you choose this")).toBeVisible();
  await expect(page.getByText("Pick an option first.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});
