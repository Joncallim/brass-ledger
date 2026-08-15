import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("loads the campaign hub and shows the scenario", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start new campaign" })).toBeVisible();
});

test("create, play, and record a full campaign month", async ({ page }) => {
  await page.goto("/");

  await test.step("create a new campaign", async () => {
    await page.getByRole("button", { name: "Start new campaign" }).click();
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
    if ((await replyButtons.count()) > 0) {
      await replyButtons.first().click();
      await expect(dialog.getByText(/Conversation finished|How you reply/)).toBeVisible();
    }
    await dialog.getByRole("button", { name: "Close conversation" }).click();
    await expect(dialog).not.toBeVisible();

    await page.getByRole("button", { name: "Continue to final review →" }).click();
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

  await test.step("visit records and export the campaign", async () => {
    await page.getByRole("button", { name: "Go to records" }).click();
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
