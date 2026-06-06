---
type: backend-finding
id: F-008
severity: P3
status: open
area: static-assets
risk: path prefix check can be fooled by sibling prefixes if route decoding changes
file: apps/server/src/index.ts
line: 441
tags:
  - backend-review
  - finding/P3
---

Backlink: [[POTATO]]


# F-008 Static Asset Prefix Check Is Fragile

## Finding

The static route resolves `filePath` under `webDistDir` and checks `filePath.startsWith(webDistDir)`. String prefix checks are fragile because `/path/dist-evil` starts with `/path/dist`.

## Impact

The current route is narrow and only serves files with extensions or the client shell, so this is lower severity than the save-store issues. Still, static file serving should use path-relative boundary checks, especially before packaged desktop distribution.

## Evidence

- `apps/server/src/index.ts:441` defines the catch-all static route.
- `apps/server/src/index.ts:448` resolves the request path.
- `apps/server/src/index.ts:449` uses `startsWith(webDistDir)`.

## Recommendation

Use `path.relative(webDistDir, filePath)` and reject if the result starts with `..` or is absolute. Also normalize `webDistDir` once with `path.resolve`.
