# Opus Review Hand-off: Save, Release, and Desktop Recovery

## Review target

- Repository: `verbose-potato` / Brass Ledger
- Review branch: `feat/stage-7.1-release-script`
- Base branch and commit: `main` at `29f647e`
- State: this document is committed alongside the complete implementation, including the new save-store, desktop, and release source. Review the complete branch diff from `29f647e`.

This pass recovered the save-store, server/CLI persistence, release assembly, and Electron packaging work after repeated adversarial review findings. The highest-value review is an attempt to disprove the concurrency, error-mapping, migration, and packaged-process invariants below.

## Intended invariants

### Filesystem saves

- A session mutation is serialized first by a per-path in-process queue, then by a cross-process `proper-lockfile` lock.
- The cross-process lock uses atomic directory creation, a 2-second heartbeat, a 10-second stale threshold, bounded randomized retries, and compromised-lock reporting.
- Save replacement is atomic: a unique temporary file is written and renamed over the destination while the lock is held.
- `write(session, expectedRevision)` is compare-and-swap. A missing file rejects with `SessionNotFoundError`; it must never resurrect a session deleted after the caller's read.
- Missing, duplicate, stale-revision, invalid-ID, corrupt-data, lock-timeout, and I/O failures retain distinct typed errors.
- A saved document whose embedded ID differs from its filename is corrupt.
- `list()` may skip corrupt or concurrently removed individual saves, but it must surface directory or file I/O failures rather than report a misleading empty store.

Primary files:

- `packages/save-store/src/contracts.ts`
- `packages/save-store/src/index.ts`
- `packages/save-store/src/index.test.ts`

### Browser saves

- The browser entry has no Node built-in imports and shares the same error-class module as the main entry.
- Mutations use the Web Locks API when available and an in-process queue for adapters sharing the same `Storage` object otherwise.
- Top-level corruption and corrupt individual entries are never silently overwritten. Valid entries remain listable, but mutation is refused until corruption is repaired.
- Browser compare-and-swap has the same missing-session and stale-revision behavior as the filesystem adapter.

Primary files:

- `packages/save-store/src/browser.ts`
- `packages/save-store/src/browser.test.ts`
- `packages/save-store/package.json`

### Server and CLI

- Authoritative server mutations pass the revision read under the server's session queue into the storage-layer compare-and-swap.
- Storage errors map consistently: invalid ID `400`, missing `404`, duplicate/stale revision `409`, lock timeout `503`, corrupt/I/O failure `500`.
- A rejected CORS origin is denied without converting the preflight into a server error. Only the explicit default origins plus `CORS_ORIGINS` are accepted.
- CLI and server migration candidates include `release/saves`, repository-relative legacy saves, the environment override, and finally the stable platform default.
- The CLI and server bundles keep runtime packages external. This is required because bundling `proper-lockfile` CommonJS into the ESM CLI reproduced a `Dynamic require of "path" is not supported` startup crash.

Primary files:

- `apps/server/src/index.ts`
- `apps/server/src/index.test.ts`
- `apps/cli/src/index.ts`
- `apps/cli/package.json`
- `apps/server/package.json`

### Desktop and release

- The packaged app launches the Node server with `utilityProcess.fork()`. It must not use the packaged Electron executable as a child-process Node binary; that previously caused recursive app spawning.
- The renderer is sandboxed, external window creation is denied, and top-level navigation is constrained to the loopback application origin.
- Desktop does not override `BRASS_LEDGER_SAVE_DIR`, so it shares the same platform save location as CLI/server unless the operator explicitly sets the environment variable.
- Release dependencies and Electron tooling are exact versions in `desktop/package-lock.json`; npm install-script permissions are explicit.
- Release assembly stages completely, installs production dependencies with `npm ci --omit=dev`, preserves `release/saves`, moves the previous release to a backup, and restores it if the final staging rename fails.
- The CLI and server artifacts use the production dependencies installed into the release directory.

Primary files:

- `desktop/main.mjs`
- `desktop/package.json`
- `desktop/package-lock.json`
- `scripts/release.mjs`
- `README.md`

## Regression coverage added or corrected

- Real eight-child-process CAS loop: 40 successful increments produce revision 40.
- Fresh lock is not stolen; a waiter proceeds only after external release.
- Stale orphan lock is reclaimed.
- Guarded write after delete rejects and leaves the save absent.
- Missing reads/deletes and invalid IDs use typed errors.
- Inaccessible directory and schema-invalid save failures are distinguished.
- Browser duplicate/missing/stale errors retain shared runtime identity.
- Browser top-level and per-entry corruption is not overwritten.
- Two browser adapters sharing storage cannot both win the same compare-and-swap revision.
- Server tests cover invalid IDs, corrupt-store `500`, stale mutation `409`, rejected CORS without `500`, and simultaneous authoritative mutations.

## Validation evidence

Final in-tree and fresh-copy validation completed on macOS arm64 with Node `26.4.0` and npm `11.17.0`:

- `npm ci --foreground-scripts`: clean install succeeds.
- `npm audit`: zero vulnerabilities.
- `npm test`: 114 passing tests total: 6 CLI, 17 server, 35 save-store/browser, 56 simulation.
- `npm run lint:content`: passes.
- `npm run lint:potato`: passes.
- `npm run build`: all workspaces build with Vite `8.1.5` and esbuild `0.28.1`.
- `npm run release`: succeeds from a dependency- and `dist`-free copy.
- `npm audit --omit=dev --prefix release`: zero vulnerabilities.
- Release CLI `--turns 0 --json --validate`: succeeds.
- Release server `/api/health`: returns `{"ok":true}`.
- A save placed in `release/saves` survives replacement and is found by `node release/cli/brass-ledger --list` without an environment override.
- Independent browser bundling of `packages/save-store/dist/browser.js` succeeds with no `node:*`, `proper-lockfile`, or `process.kill` references.
- `npm ci && npm run package` in `release/` creates `release/dist/mac-arm64/Brass Ledger.app` with Electron `43.1.1` and electron-builder `26.15.3`.
- Launching that unpacked app produces one Electron main process, one Node utility-process server, normal GPU/network/renderer helpers, a sandboxed renderer, and a healthy API on port 4000. No recursive executable tree appears.
- `git diff --check`: passes.

## Requested adversarial review

Please focus on these questions rather than repeating only happy-path tests:

1. Can any lock acquisition, operation, compromised-lock callback, or release failure leave the in-process queue permanently blocked or allow overlapping writers?
2. Can a stale lock be reclaimed while a healthy writer is still operating, especially during a long synchronous serialization or a suspended process?
3. Can any filesystem or browser compare-and-swap path recreate a deleted session or permit two callers to commit against one revision?
4. Can malformed storage be converted into data loss by `create`, `write`, or `delete`?
5. Do all storage failures reach the intended HTTP status rather than being flattened into `400`/`404` or an unhelpful framework error?
6. Does the release remain runnable when copied outside the repository, with only its own locked dependencies present?
7. On Windows and Linux, do the configured package targets build, start the utility-process server, resolve platform save paths, and stop the server when the shell exits?
8. Can release replacement be fault-injected at each copy/install/rename boundary without losing the previous artifact or its saves?

## Known review boundaries and residual distribution work

- Cross-tab browser atomicity depends on the Web Locks API. The fallback only serializes adapters sharing the same in-memory `Storage` object; confirm whether unsupported browsers require IndexedDB or another cross-context coordinator before browser persistence ships.
- macOS signing/notarization was not possible because no valid Developer ID identity was available. The unpacked app is runtime-validated but not distribution-approved.
- Windows and Linux targets were not built on this macOS host and need native or CI packaging proof.
- No product icon is configured, so electron-builder currently uses the default Electron icon.
- The rollback branch in `scripts/release.mjs` was inspected and the successful save-preserving replacement was exercised, but automated failure injection for every filesystem boundary is not yet present.
- The web workspace currently reports zero automated browser tests. The packaged shell loaded the client, static assets, scenario, and sessions endpoints successfully, but this is smoke evidence rather than full UI regression coverage.
