import { test, expect, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { soloScenario, spriteVisualLanguage } from "@brass-ledger/content";
import {
  buildAdvisorPortraitDataUri,
  buildChiefSpriteSpec,
  buildSpritePixels,
  createInitialGameSession,
  SPRITE_PIXEL_HARNESS,
  spritePixelRuns,
  type ChiefSpriteVariantState,
  type SpriteSpec,
} from "@brass-ledger/shared";
import { ChiefPortrait } from "../src/components/ChiefPortrait";

/**
 * Sprite 4 visual matrix (issue #82): renders every roadmap state for one chief per
 * S-role (S1-S5) from generated data URIs via page.setContent only — no webServer, no
 * API, no build of the app itself. The committed toHaveScreenshot baseline is the
 * human-review artifact at zero tolerance; a 2× diagnostic composite is also saved to
 * test-results/sprite-matrix-review.png (gitignored). In-browser canvas probes verify
 * that crispEdges renders every logical 24×28 cell as an exact uniform 2×2 physical
 * block matching buildSpritePixels(sprite).output.
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

type MatrixCell = {
  chief: (typeof soloScenario.chiefs)[number];
  label: string;
  state: ChiefSpriteVariantState;
  sprite: SpriteSpec;
  output: string[];
};

async function buildMatrix(page: Page) {
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
  const cells: MatrixCell[] = [];
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
      cells.push({ chief, label, state, sprite, output: [...buildSpritePixels(sprite).output.cells] });
    }
  }
  const cellHtml = cells.map((cell) =>
    `<figure class="cell"><img class="cell-img" data-role="${cell.sprite.role}" data-state="${cell.label}" data-expression="${cell.sprite.expression}" width="48" height="56" alt="${cell.sprite.role} ${cell.label}" src="${buildAdvisorPortraitDataUri(cell.sprite)}" /><figcaption>${cell.sprite.role} · ${cell.label}</figcaption></figure>`,
  ).join("");
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
    <div class="matrix">${cellHtml}</div>
    <h2>2× (96×112, human review)</h2>
    <div class="matrix matrix-2x">${cellHtml}</div>
  </body></html>`);

  return { imgs: page.locator("img.cell-img"), cells, total: cells.length };
}

/** Every logical cell must expand to a uniform 2×2 physical block equal to the canonical matrix RGB. */
async function expectExactPixelBlocks(img: ReturnType<Page["locator"]>, expected: string[]) {
  const probe = await img.evaluate(async (el, matrix) => {
    const image = el as HTMLImageElement;
    if (image.naturalWidth !== 24 || image.naturalHeight !== 28) {
      return { msg: `intrinsic size ${image.naturalWidth}×${image.naturalHeight}, expected 24×28` };
    }
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 56;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0, 48, 56);
    const data = ctx.getImageData(0, 0, 48, 56).data;
    const hex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    for (let y = 0; y < 28; y += 1) {
      for (let x = 0; x < 24; x += 1) {
        const r = data[(y * 2 * 48 + x * 2) * 4];
        const g = data[(y * 2 * 48 + x * 2) * 4 + 1];
        const b = data[(y * 2 * 48 + x * 2) * 4 + 2];
        const color = hex(r, g, b);
        if (color !== matrix[y * 24 + x]) return { msg: `cell (${x},${y}) is ${color}, expected ${matrix[y * 24 + x]}` };
        for (const [dx, dy] of [[1, 0], [0, 1], [1, 1]] as const) {
          if (data[((y * 2 + dy) * 48 + x * 2 + dx) * 4] !== r) return { msg: `cell (${x},${y}) block is not uniform` };
        }
      }
    }
    return null;
  }, expected);
  expect(probe).toBeNull();
}

/** Screenshot the element itself, then inspect every rendered physical pixel block. */
async function expectRenderedPixelBlocks(page: Page, img: ReturnType<Page["locator"]>, expected: string[], scale: 2 | 3 | 4) {
  const screenshot = (await img.screenshot()).toString("base64");
  const probe = await page.evaluate(async ({ encoded, matrix, blockScale }) => {
    const rendered = new Image();
    rendered.src = `data:image/png;base64,${encoded}`;
    await rendered.decode();
    const expectedWidth = 24 * blockScale;
    const expectedHeight = 28 * blockScale;
    if (rendered.width !== expectedWidth || rendered.height !== expectedHeight) {
      return { msg: `screenshot ${rendered.width}×${rendered.height}, expected ${expectedWidth}×${expectedHeight}` };
    }
    const canvas = document.createElement("canvas");
    canvas.width = rendered.width;
    canvas.height = rendered.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(rendered, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const hex = (r: number, g: number, b: number) => `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
    for (let y = 0; y < 28; y += 1) {
      for (let x = 0; x < 24; x += 1) {
        const start = ((y * blockScale) * canvas.width + x * blockScale) * 4;
        const expectedColor = matrix[y * 24 + x];
        for (let dy = 0; dy < blockScale; dy += 1) {
          for (let dx = 0; dx < blockScale; dx += 1) {
            const offset = (((y * blockScale + dy) * canvas.width) + x * blockScale + dx) * 4;
            const actual = hex(data[offset], data[offset + 1], data[offset + 2]);
            if (actual !== expectedColor) return { msg: `cell (${x},${y}) physical pixel (${dx},${dy}) is ${actual}, expected ${expectedColor}; first pixel offset ${start}` };
          }
        }
      }
    }
    return null;
  }, { encoded: screenshot, matrix: expected, blockScale: scale });
  expect(probe).toBeNull();
}

test("obsolete two-chief visual baseline is rejected at zero tolerance", async ({ page }) => {
  const { cells } = await buildMatrix(page);
  // The negative fixture is byte-locked: it must never be regenerated with the
  // positive baseline (v2 §8.4). Its verified MD5 is 1749ac6669411a2f0eddf482a441b115.
  const negative = readFileSync("e2e-visual/sprite-matrix.spec.ts-snapshots/sprite-matrix-two-chiefs-sprite-matrix-linux.png");
  expect(createHash("md5").update(negative).digest("hex")).toBe("1749ac6669411a2f0eddf482a441b115");
  // This fixture is the pre-3d1837e two-chief artifact. It must never silently bless the
  // five-chief matrix again: Playwright's negative assertion passes only when exact pixels differ.
  await expect(page).not.toHaveScreenshot("sprite-matrix-two-chiefs.png", { maxDiffPixelRatio: 0 });
  expect(cells.length).toBe(45);
});

test("sprite variant matrix renders at 48×56 and 2× for human review", async ({ page }) => {
  const started = Date.now();
  const { imgs, cells, total } = await buildMatrix(page);
  await expect(imgs).toHaveCount(total * 2, { timeout: 15_000 });

  // Canonical matrix checks (shared, no browser): every global-effect state differs from
  // its role-appropriate neutral, while S2-low differs only for the S2 row and S4-bottleneck
  // only for the S4 row — a labeled-but-unexercised cell cannot pass review (v2 §8.4).
  const neutralByChief = new Map(cells.filter((cell) => cell.label === "neutral").map((cell) => [cell.sprite.role, cell.output]));
  const stateKey = (cell: MatrixCell) => `${cell.sprite.role}/${cell.label}`;
  for (const cell of cells) {
    const neutral = neutralByChief.get(cell.sprite.role)!;
    if (cell.label === "neutral") continue;
    if (cell.label === "s2-low") {
      if (cell.sprite.role === "S2") {
        expect(cell.output).not.toEqual(neutral);
        expect(cell.sprite.variant.framing).toBe("tight");
      } else {
        expect(cell.output).toEqual(neutral, `${stateKey(cell)}: S2 signal is role-gated`);
      }
    } else if (cell.label === "s4-bottleneck") {
      if (cell.sprite.role === "S4") {
        expect(cell.output).not.toEqual(neutral);
        expect(cell.sprite.variant.supportDetail).toBe("utility-harness");
      } else {
        expect(cell.output).toEqual(neutral, `${stateKey(cell)}: S4 signal is role-gated`);
      }
    } else {
      expect(cell.output).not.toEqual(neutral, `${stateKey(cell)} must visibly change the pixels`);
    }
  }
  // Role-gated rows genuinely exercise their projection/harness controls.
  const s2 = cells.find((cell) => cell.sprite.role === "S2" && cell.label === "s2-low")!;
  const s2Render = buildSpritePixels(s2.sprite);
  expect(s2Render.output.cells).not.toEqual(s2Render.sourceColors.cells);
  const s4 = cells.find((cell) => cell.sprite.role === "S4" && cell.label === "s4-bottleneck")!;
  const s4Render = buildSpritePixels(s4.sprite);
  const s4Neutral = cells.find((cell) => cell.sprite.role === "S4" && cell.label === "neutral")!;
  const s4NeutralRender = buildSpritePixels(s4Neutral.sprite);
  // §3.11 has 22 authored writes; its strap/rim overlap has 20 unique physical cells.
  const declaredHarnessWrites = SPRITE_PIXEL_HARNESS.map(([x, y]) => `${x},${y}`);
  const declaredHarnessCells = [...new Set(declaredHarnessWrites)].sort();
  expect(declaredHarnessWrites).toHaveLength(22);
  expect(s4Render.source.cells.flatMap((cell, index) =>
    cell.basePaletteIndex === s4NeutralRender.source.cells[index].basePaletteIndex ? [] : [`${index % 24},${Math.floor(index / 24)}`],
  ).sort()).toEqual(declaredHarnessCells);

  // In-browser: intrinsic 24×28, exact 48×56 CSS box, and every 2×2 physical block
  // equals the canonical matrix RGB cell (crispEdges, no anti-alias shades).
  for (let index = 0; index < total; index += 1) {
    const img = imgs.nth(index);
    const naturalWidth = await img.evaluate((el) => (el as HTMLImageElement).naturalWidth);
    expect(naturalWidth).toBe(24);
    const naturalHeight = await img.evaluate((el) => (el as HTMLImageElement).naturalHeight);
    expect(naturalHeight).toBe(28);
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
    await expectExactPixelBlocks(img, cells[index].output);
  }

  // Human-review composite at 2× (gitignored; path recorded in the PR body).
  await page.screenshot({ path: "test-results/sprite-matrix-review.png", fullPage: true });
  // Committed baseline = the accepted 48×56 matrix artifact, scoped to the first .matrix
  // grid so the font-dependent <h2>/<figcaption> page chrome can't flake the zero-tolerance
  // diff across machines (the SVGs are deterministic; the surrounding text is not).
  await expect(page.locator(".matrix").first()).toHaveScreenshot("sprite-matrix.png", { maxDiffPixelRatio: 0 });

  // Record the strict DOM bound and wall time (v2 §4A): one rect per horizontal run.
  const totalRects = cells.reduce((sum, cell) => sum + spritePixelRuns(cell.output).length, 0);
  const elapsed = Date.now() - started;
  console.log(`sprite-matrix: ${total} unique images × 2 matrices = ${total * 2} imgs, ${totalRects} rects per full matrix pair run total ${totalRects * 2}, wall ${elapsed}ms`);

  // Product-path regression: render the actual ChiefPortrait markup, apply the built
  // Tailwind stylesheet, and inspect screenshots of the element itself. This catches a
  // consuming border even if the visual-matrix fixture uses a non-consuming outline.
  const cssAssets = readdirSync("dist/assets").filter((file) => file.endsWith(".css"));
  expect(cssAssets).toHaveLength(1);
  const productCss = readFileSync(`dist/assets/${cssAssets[0]}`, "utf8");
  const productCell = cells[0];
  const sizes: { size: "sm" | "md" | "lg"; width: number; height: number; scale: 2 | 3 | 4 }[] = [
    { size: "sm", width: 48, height: 56, scale: 2 },
    { size: "md", width: 72, height: 84, scale: 3 },
    { size: "lg", width: 96, height: 112, scale: 4 },
  ];
  const productHtml = sizes.map(({ size }) => {
    // Call the product component itself, then render the exact props it returns into this
    // browser-only fixture. React's server renderer and the Playwright TS loader carry
    // different React symbols, so serializing the returned DOM props keeps the fixture
    // focused on the production class/data-URI contract without crossing React runtimes.
    const portrait = ChiefPortrait({ sprite: productCell.sprite, title: "Product probe", size }) as unknown as {
      props: { src: string; alt: string; className: string; style: { imageRendering: string } };
    };
    const { src, alt, className, style } = portrait.props;
    expect(className).toContain("object-cover");
    expect(style.imageRendering).toBe("pixelated");
    return `<div data-product-size="${size}"><img src="${src}" alt="${alt}" class="${className}" style="image-rendering:${style.imageRendering}" /></div>`;
  }).join("");
  await page.setContent(`<!doctype html><html><head><style>${productCss}</style></head><body>${productHtml}</body></html>`);
  const measuredContentBoxes: string[] = [];
  for (const { size, width, height, scale } of sizes) {
    const img = page.locator(`[data-product-size="${size}"] img`);
    await expect(img).toHaveCount(1);
    const metrics = await img.evaluate((el) => {
      const image = el as HTMLImageElement;
      return { clientWidth: image.clientWidth, clientHeight: image.clientHeight, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
    });
    expect(metrics).toEqual({ clientWidth: width, clientHeight: height, naturalWidth: 24, naturalHeight: 28 });
    measuredContentBoxes.push(`${size} ${metrics.clientWidth}×${metrics.clientHeight}`);
    await expectRenderedPixelBlocks(page, img, productCell.output, scale);
  }
  console.log(`ChiefPortrait product client boxes: ${measuredContentBoxes.join(", ")}`);
});
