---
type: game-engine-action
area: roadmap
status: active
priority: P1
tags:
  - POTATO
  - roadmap
  - epics
  - issues
---

# Roadmap Epics And Issues

Backlink: [[POTATO]]

This note maps the forward roadmap onto tracked GitHub issues. It records which
development stages are complete, and breaks every **subsequent** roadmap epic
into concrete issues so the backlog is planned rather than improvised. Update it
whenever an epic's scope or issue set changes.

Roadmap sources: [[development-stages]], [[compiled-engine-roadmap]],
[[sprite-design-logic]], [[doctrine-mechanics-roadmap]],
[[s1-s5-mechanics-translation]], [[game-engine-review/06-recommendations-and-roadmap]].

## Stage Status

An **epic** is a development stage (or a standalone forward roadmap stream). The
completed stages were already tracked issue-by-issue; the table below reflects
where the engine actually stands, not the older status fields in
[[development-stages]].

| Stage / stream | Status | Evidence |
| --- | --- | --- |
| Stage 0 — Source of truth and headless direction | Complete | `apps/cli` builds and runs; GROCER vault is canonical. |
| Stage 1 — Engine contract stabilization | Complete | `StaffFunctionReadout`, explainability, content-owned staff capacities. |
| Stage 2 — S1-S5 core mechanic | Complete | Issues #4–#11; `staffMechanics` S1-S5 + accepted-risk slice. |
| Stage 3 — Dual tech tree and industry model | Complete | Internal/external tech nodes, S2 estimates (noted done in #17). |
| Stage 4 — Agent chiefs and negotiation | Complete | Issues #17–#20; agenda memory, coalitions, commitments, pre-commit negotiation. |
| Stage 5 — Content expansion and balance | Complete | Issues #28–#30; batch telemetry, content validation, expanded event set. |
| Stage 6 — Browser interface rebuild | Complete | Six-screen client under `apps/web/src`; #66 was closed by PR #70. Remaining follow-up issues, if any, are tracked on GitHub rather than inferred from this historical list. |
| **Stage 7 — Packaged game** | **Complete and remotely attested** | Epic #41 exit criteria are met by the compiled release, offline save/replay path, Electron shell, no-dev-server release smoke, green CI, and green Linux/macOS/Windows packaged-desktop smoke on `a263e43`. |
| **Sprite & asset generation pipeline** | **Subsequent epic** | Epic #48. Deferred from Stage 6 (`POTATO/stage-6-gui-design.md`). |
| **Doctrine faction-gene system & optional staff modules** | **Subsequent epic** | Epic #49. Phases 2–5 of [[doctrine-mechanics-roadmap]]. |

### Remote Attestation Record

The former GitHub-hosted runner allocation failure is resolved and issue #92
is closed. On `a263e43`, CI run
[`33215009310`](https://github.com/Joncallim/brass-ledger/actions/runs/33215009310)
completed its `verify` job, including content/GROCER/assets validation, full
tests, build, and Chromium E2E. Desktop package run
[`33215009328`](https://github.com/Joncallim/brass-ledger/actions/runs/33215009328)
completed the Linux AppImage, macOS DMG, and Windows NSIS builds and their
platform-specific packaged-desktop smokes.

The documented local gate remains useful release evidence, but hosted
attestation is no longer a release blocker. Public deployment is instead gated
on the outstanding #90 fresh-player playability observations.

## Epic — Stage 7: Packaged Game (#41)

Turn the compiled, headless-first engine into a distributable game with offline
saves and replay portability. Source: [[development-stages]] Stage 7 and
[[compiled-engine-roadmap]] compile targets.

- #42 — Stage 7.1: single-command local executable and release script
- #43 — Stage 7.2: offline-capable save/replay store without the dev server
- #44 — Stage 7.3: desktop shell around the compiled engine
- #45 — Stage 7.4: replay export/import in the packaged build
- #46 — Stage 7.5: release build with no Vite dev-server dependency
- #47 — Stage 7.6: native/WASM evaluation spike

## Epic — Sprite & Asset Generation Pipeline (#48)

Promote the deterministic advisor portraits into the full sprite/asset contract:
richer specs, prompt output, state variants, optional bitmap generation, and
provenance/licensing. Source: [[sprite-design-logic]].

- #50 — Sprite 1: promote AdvisorPortraitSpec to the full SpriteSpec contract
- #51 — Sprite 2: emit prompt and negative-prompt text beside the deterministic SVG
- #52 — Sprite 3: state-driven sprite variants
- #53 — Sprite 4: optional bitmap generation with deterministic seed and prompt-hash cache
- #54 — Sprite 5: GeneratedAssetRecord provenance and license gating

## Epic — Doctrine Faction-Gene System & Optional Staff Modules (#49)

Turn the CELERY doctrine substrate into data-driven faction identity that changes
staff argument, burden routing, and events without replacing the S1-S5 contract.
Sources: [[doctrine-mechanics-roadmap]], [[s1-s5-mechanics-translation]],
[[../CELERY/faction-doctrine-gene-bank]], [[../CELERY/doctrine-proof-register]].

- #55 — Doctrine 1: add neutral DoctrineMechanicsState variables and pattern-to-mechanic gates
- #56 — Doctrine 2: scenario-level doctrine genes / DoctrineProfile
- #57 — Doctrine 3: genes alter chief advice style and burden routing
- #58 — Doctrine 4: faction-specific events maturing from overused doctrine
- #59 — Doctrine 5: optional staff modules (J6/J8/J9/STRATCOM/MED/ENGINEER)

## Working Rule

- Each epic is a GitHub parent issue; its work items are sub-issues linked in the
  GitHub hierarchy and listed above.
- Keep the "First Implementation Slice" already built in Stage 2 (accepted risks,
  S4 `supportableTempo`, doctrine-bet after-action) — the doctrine epic extends
  it rather than duplicating it.
- Every doctrine trait derived from real-world doctrine must carry at least one
  evidence reference into CELERY, per the guardrails in [[s1-s5-mechanics-translation]].
