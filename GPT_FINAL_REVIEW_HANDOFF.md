# Final Review & Merge Hand-off → GPT-5.6 Sol (XHigh)

You are the final reviewer and merge executor for **PR #61 — Stage 7.1: add
persistence and desktop release**. Opus completed the adversarial review of the
save-store / server / CLI / release / desktop work and applied one fix. Your job
is an independent final pass and, if it holds up, executing the merge.

## Target

- Repository: `Joncallim/brass-ledger`
- PR: [#61](https://github.com/Joncallim/brass-ledger/pull/61) (**draft**)
- Branch: `feat/stage-7.1-release-script`
- Head commit at hand-off: `ca4e152bf041039ff085cee8d2ba0d8f5a1cd105`
- Base: `main` @ `29f647e`
- `mergeable_state` at hand-off: `clean`
- Two commits: `d7f35b3` (implementation) + `ca4e152` (Opus fix, below)
- The original invariants, adversarial questions, and evidence are in
  `OPUS_REVIEW_HANDOFF.md`. Read it first — this doc assumes it.

## State of CI at hand-off (head `ca4e152`)

All green: `verify` (push workflow) ✅, `verify` (PR workflow) ✅,
`GitGuardian Security Checks` ✅. Re-confirm live before merging — do not trust
this snapshot.

## What Opus verified (attempted to *disprove* each invariant)

| # | Invariant | Verdict | How it was checked |
|---|---|---|---|
| 1 | Lock/queue never permanently blocks or overlaps writers | **Holds** | Every acquire-`catch`/release path calls `resolveNext()`/`release()` in `finally`; in-process queue serializes acquisition. |
| 2 | Stale lock not reclaimed under a healthy writer | **Holds (documented boundary)** | Real tests: fresh lock not stolen; 120 s-stale orphan reclaimed. >10 s event-loop stall / SIGSTOP is the proper-lockfile limit, mitigated by `onCompromised` → `SaveStoreIOError`. |
| 3 | CAS never resurrects a deleted session or double-commits | **Holds** | Guarded write reads under lock → `SessionNotFoundError` after delete, file stays absent. **Real 8-child-process CAS test: 40 increments → revision exactly 40.** |
| 4 | Malformed storage cannot cause data loss | **Holds** | FS `create` checks existence; guarded `write` reads-first; browser `assertSafeToMutate` refuses mutation while any entry is corrupt. |
| 5 | All storage failures reach the intended HTTP status | **Fixed** | Was falsified on two endpoints; see the fix below. |
| 6 | Release runnable when copied outside the repo | **Holds — empirically** | Release copied to a dir outside the repo tree; `node cli/brass-ledger --list` and `node server/index.js` both worked (`/api/health` → `{ok:true}`). Only `fastify`, `@fastify/cors`, `proper-lockfile`, `zod` are external and all are in `desktop/package.json`; workspace packages are inlined by esbuild. |
| 7 | Windows/Linux desktop targets build & run | **Unverified** | No Electron/Windows in the review container. Linux save-path confirmed. See residual work. |
| 8 | Release replacement fault-tolerant; never loses artifact/saves | **Holds** | Save in `release/saves` survived a full re-run. **Fault-injected the final `rename(staging→release)`**: rollback restored the previous `release/` and its saves, no orphaned backup. |

## The fix Opus applied (`ca4e152`)

**Finding 1 — `GET /api/sessions` and `POST /api/sessions` bypassed
`mapStorageError`.** They were the only session endpoints without a `try/catch`,
so a storage failure escaped to Fastify's default handler: it leaked the raw
internal message, returned `{statusCode,error,message}` instead of the sanitized
`{error}` contract, and would have mapped a `LockTimeoutError` on create to 500
instead of 503. Both handlers now use the same
`mapStorageError` / `unexpectedServerError` pattern as their siblings. A
regression test (`apps/server/src/index.test.ts`) forces `list()` to raise
`SaveStoreIOError` via an `EISDIR` save entry and asserts the sanitized 500
shape. Server tests: 17 → 18, all green. `npm run build` clean.

## Your job

### 1. Independent final review — focus, don't re-run happy paths

Prioritize what Opus could **not** fully close:

- **Windows & Linux packaging (Q7).** electron-builder targets are `dmg` / `nsis`
  / `AppImage`. Confirm on native or CI runners that each target builds, the
  `utilityProcess.fork()` server starts, platform save paths resolve
  (`APPDATA` on win32, XDG on linux), and the server stops when the shell exits.
  `desktop/main.mjs` `stopServer()` is wired to `window-all-closed`,
  `before-quit`, and `win 'closed'` — verify `serverProcess.kill()` actually
  terminates the utility process on Windows.
- **Release rollback double-fault (residual Finding 2).** `scripts/release.mjs`
  unconditionally `rm`s `release-backup` at the top of each run. If the final
  rename fails *and* the restore rename also fails, the last-known-good sits in
  `release-backup/`, and the next run would delete it. Deep edge case; decide
  whether to guard it now or file a follow-up.
- **No Windows `start.sh` (residual Finding 3).** The standalone-server launcher
  is bash-only. Fine if desktop is the only Windows story; a gap otherwise.
- **Browser cross-tab atomicity (known boundary).** Correctness across tabs
  depends on the Web Locks API; the fallback only serializes adapters sharing
  the same in-memory `Storage`. Confirm whether unsupported browsers need
  IndexedDB/another coordinator before browser persistence ships.
- **Web UI regression coverage (known boundary).** The web workspace has zero
  automated browser tests; only smoke evidence exists.
- Re-verify the fix commit: read `ca4e152`, confirm the two endpoints now map
  storage errors and the regression test genuinely fails without the fix.

### 2. Merge gate — ALL must be true before merging

- [ ] Your independent review surfaced nothing blocking (or blockers are fixed
      and re-pushed).
- [ ] `mergeable_state` is `clean` and the branch is up to date with `main`
      (update/rebase onto `main` if it has advanced).
- [ ] Every required check on the **current** head sha is `success` — re-fetch,
      do not rely on this doc's snapshot.
- [ ] No unresolved review threads.
- [ ] `npm test`, `npm run build`, `npm run lint:content`, `npm run lint:potato`
      pass on the final head.

### 3. Execute the merge

1. (Optional, recommended) Strip review scaffolding from the merged tree if you
   don't want it in `main`: delete `OPUS_REVIEW_HANDOFF.md` and this file, commit
   ("Remove Stage 7.1 review scaffolding"), let CI re-green.
2. Mark the PR **ready for review** (undraft) — a draft cannot be merged.
3. Merge into `main`. Prefer **squash** unless the two-commit history is wanted;
   title e.g. `Stage 7.1: add persistence and desktop release (#61)`.
4. Delete the branch after merge (optional).
5. Confirm `main` builds post-merge.

### Abort / escalate instead of merging if

- Any merge-gate item can't be satisfied, or a residual item turns into a real
  blocker.
- The base branch has diverged in a way that needs non-trivial conflict
  resolution — resolve and re-run the full gate rather than force-merging.
- macOS signing/notarization or Windows/Linux packaging is a hard release
  requirement — those are explicitly unverified here and out of this PR's scope.

## Evidence appendix — what Opus actually ran

- Fetched `feat/stage-7.1-release-script`, `npm ci` (166 pkgs), `npm run build`,
  `npm test`. Full suite green except the root-container artifact below.
- Test suite: 6 CLI + 18 server (was 17) + 34/35 save-store + 56 sim. The one
  save-store failure (`list reports an inaccessible directory`) is a **root-user
  container artifact**: `chmod 000` doesn't restrict uid 0, so the dir stays
  readable. Passes on the non-root macOS validation host. The `list()` code is
  correct.
- Ran `scripts/release.mjs`; copied `release/` **outside** the repo tree; ran the
  CLI and server there successfully; confirmed `electron`/`electron-builder`
  absent under `--omit=dev` (node_modules 22M).
- Verified save-in-`release/saves` survives replacement; fault-injected the final
  rename and confirmed rollback restored the previous artifact + saves.
- Induced a real `SaveStoreIOError` (save dir pointed at a file) and observed the
  raw Fastify envelope on the two unmapped endpoints vs the sanitized shape on a
  mapped endpoint — the basis for Finding 1.
- Verified CORS: rejected origin → no ACAO, no 500; allowed origin → ACAO
  present.
