import test from "node:test";
import assert from "node:assert/strict";

import { stripAssetCrossorigin } from "../src/build/stripAssetCrossorigin.ts";

test("removes crossorigin from a built module script tag", () => {
  const html = '<script type="module" crossorigin src="/assets/index-CtLAPg4n.js"></script>';
  assert.equal(stripAssetCrossorigin(html), '<script type="module" src="/assets/index-CtLAPg4n.js"></script>');
});

test("removes crossorigin from a built stylesheet link tag", () => {
  const html = '<link rel="stylesheet" crossorigin href="/assets/index-DxOnS-Ry.css">';
  assert.equal(stripAssetCrossorigin(html), '<link rel="stylesheet" href="/assets/index-DxOnS-Ry.css">');
});

test("removes crossorigin regardless of attribute order", () => {
  const html = '<script crossorigin type="module" src="/assets/index-abc.js"></script>';
  assert.equal(stripAssetCrossorigin(html), '<script type="module" src="/assets/index-abc.js"></script>');
});

test("leaves non-asset crossorigin tags untouched", () => {
  const html =
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' +
    '<script type="module" crossorigin src="/assets/index-abc.js"></script>';
  const result = stripAssetCrossorigin(html);
  assert.match(result, /fonts\.gstatic\.com" crossorigin/);
  assert.doesNotMatch(result, /assets\/index-abc\.js"[^>]*crossorigin|crossorigin[^>]*assets\/index-abc\.js/);
});

test("leaves html without asset tags unchanged", () => {
  const html = "<title>Brass Ledger</title>";
  assert.equal(stripAssetCrossorigin(html), html);
});
