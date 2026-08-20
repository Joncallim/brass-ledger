import { test, expect, type Page } from "@playwright/test";
import { soloScenario, spriteVisualLanguage } from "@brass-ledger/content";
import {
  buildAdvisorPortraitDataUri,
  buildChiefSpriteSpec,
  createInitialGameSession,
  type ChiefSpriteVariantState,
} from "@brass-ledger/shared";

/**
 * Sprite 3 visual matrix (issue #52, Q5): renders every roadmap state for one chief per
 * S-role (S1-S5) from generated data URIs via page.setContent only — no webServer, no API,
 * no build of the app itself (only the workspace dist it imports). The committed
 * toHaveScreenshot baseline is the human-review artifact; a 2× composite is also saved to
 * test-results/sprite-matrix-review.png (gitignored) for convenience.
 */
const states: { label: string; state: ChiefSpriteVariantState }[] = [
  { label: "neutral", state: { trustBand: "steady", burdenLevel: "light", campaignStatus: "active", s2ExternalEstimateConfidence: 46, s4SupportableTempo: 50 } },
  { label: "trust-low", state: { trustBand: "strained", burdenLevel: "light", campaignStatus: "active", s2ExternalEstimateConfidence: 46, s4SupportableTempo: 50 } },
  { label: "trust-high", state: { trustBand: "solid", burdenLevel: "light", campaignStatus: "active", s2ExternalEstimateConfidence: 46, s4SupportableTempo: 50 } },
  { label: "overloaded", state: { trustBand: "steady", burdenLevel: "overloaded", campaignStatus: "active", s2ExternalEstimateConfidence: 46, s4SupportableTempo: 50 } },
  { label: "strained-burden", state: { trustBand: "steady", burdenLevel: "strained", campaignStatus: "active", s2ExternalEstimateConfidence: 46, s4SupportableTempo: 50 } },
  { label: "won", state: { trustBand: "steady", burdenLevel: "light", campaignStatus: "won", s2ExternalEstimateConfidence: 46, s4SupportableTempo: 50 } },
  { label: "lost", state: { trustBand: "steady", burdenLevel: "light", campaignStatus: "lost", s2ExternalEstimateConfidence: 46, s4SupportableTempo: 50 } },
  { label: "s2-low", state: { trustBand: "steady", burdenLevel: "light", campaignStatus: "active", s2ExternalEstimateConfidence: 30, s4SupportableTempo: 50 } },
  { label: "s4-bottleneck", state: { trustBand: "steady", burdenLevel: "light", campaignStatus: "active", s2ExternalEstimateConfidence: 46, s4SupportableTempo: 10 } },
];

async function renderSpriteMatrix(page: Page) {
  const session = createInitialGameSession(soloScenario, "sprite-matrix-session");
  // One chief per S-role so every role-gated effect (S2 tight framing, S4 utility detail)
  // is genuinely exercised in the human-review baseline, not just labeled.
  const chiefs = [
    soloScenario.chiefs.find((chief) => chief.directorate === "people")!,
    soloScenario.chiefs.find((chief) => chief.directorate === "intelligence")!,
    soloScenario.chiefs.find((chief) => chief.directorate === "operations")!,
    soloScenario.chiefs.find((chief) => chief.directorate === "sustainment")!,
    soloScenario.chiefs.find((chief) => chief.directorate === "plans")!,
  ];
  const cells: string[] = [];
  for (const chief of chiefs) {
    const advisor = session.advisorRoster.find((entry) => entry.chiefId === chief.id)!;
    for (const { label, state } of states) {
      const sprite = buildChiefSpriteSpec({
        chief,
        portrait: advisor.portrait,
        sessionSeed: session.id,
        variantState: state,
        visualLanguage: spriteVisualLanguage,
      });
      cells.push(
        `<figure class="cell"><img class="cell-img" data-role="${sprite.role}" data-state="${label}" data-expression="${sprite.expression}" width="48" height="56" alt="${sprite.role} ${label}" src="${buildAdvisorPortraitDataUri(sprite)}" /><figcaption>${sprite.role} · ${label}</figcaption></figure>`,
      );
    }
  }
  const columnCount = states.length;
  await page.setContent(`<!doctype html><html><head><style>
    body { background: #16181c; color: #d7dadd; font: 12px system-ui, sans-serif; margin: 24px; }
    h2 { font-weight: 600; opacity: 0.85; margin: 0 0 12px; }
    .matrix { display: grid; grid-template-columns: repeat(${columnCount}, auto); gap: 18px; align-items: start; }
    .matrix + h2 { margin-top: 40px; }
    .cell { margin: 0; text-align: center; }
    .cell-img { outline: 1px solid #3a3f47; outline-offset: 2px; display: block; }
    .matrix-2x .cell-img { width: 96px; height: 112px; }
    figcaption { margin-top: 8px; opacity: 0.75; font-size: 11px; }
  </style></head><body>
    <h2>48×56 (chiefs paper small size)</h2>
    <div class="matrix">${cells.join("")}</div>
    <h2>2× (96×112, human review)</h2>
    <div class="matrix matrix-2x">${cells.join("")}</div>
  </body></html>`);

  return { imgs: page.locator("img.cell-img"), total: chiefs.length * states.length };
}

test("obsolete two-chief visual baseline is rejected at zero tolerance", async ({ page }) => {
  await renderSpriteMatrix(page);
  // This fixture is the pre-3d1837e two-chief artifact. It must never silently bless the
  // five-chief matrix again: Playwright's negative assertion passes only when exact pixels differ.
  await expect(page).not.toHaveScreenshot("sprite-matrix-two-chiefs.png", { maxDiffPixelRatio: 0 });
});

test("sprite variant matrix renders at 48×56 and 2× for human review", async ({ page }) => {
  const { imgs, total } = await renderSpriteMatrix(page);
  await expect(imgs).toHaveCount(total * 2, { timeout: 15_000 });
  // Every 48px image must decode, report nonzero intrinsic size, and sit in an exact 48×56 box.
  for (let index = 0; index < total; index += 1) {
    const img = imgs.nth(index);
    const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
    const decoded = await img.evaluate(async (el) => {
      try {
        await (el as HTMLImageElement).decode();
        return true;
      } catch {
        return false;
      }
    });
    expect(decoded).toBe(true);
    const box = await img.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeCloseTo(48, 1);
    expect(box!.height).toBeCloseTo(56, 1);
  }
  // Human-review composite at 2× (gitignored; path recorded in the PR body).
  await page.screenshot({ path: "test-results/sprite-matrix-review.png", fullPage: true });
  // Committed baseline = the accepted 48×56 matrix artifact, scoped to the first .matrix
  // grid so the font-dependent <h2>/<figcaption> page chrome can't flake the zero-tolerance
  // diff across machines (the SVGs are deterministic; the surrounding text is not).
  await expect(page.locator(".matrix").first()).toHaveScreenshot("sprite-matrix.png", { maxDiffPixelRatio: 0 });
});
