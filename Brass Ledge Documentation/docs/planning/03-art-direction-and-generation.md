# Brass Ledger — Art Direction & Artwork Generation Plan

## 1. Style Goals
- Strategic command-center visual language.
- High readability under dense information.
- Stylized realism for portraits and event panels.
- Infographic-first map and systems UI.

## 2. Visual System
- Color roles: action, warning, critical, intelligence confidence, alliance posture.
- Typography: compact UI font + high-contrast heading font.
- Icon set: consistent stroke/filled pairs for resources and systems.

## 3. Asset Buckets (MVP)
- UI kit (panels, controls, charts, alerts)
- Regional/theater map layers
- Subordinate portraits
- Event card art
- Faction/industry/technology icons

## 4. AI-Assisted Art Pipeline
1. Prompted concept generation per asset class.
2. Curate candidates against style bible.
3. Consistency pass (palette, silhouette, lighting).
4. Integration pass in UI context for readability.
5. Export/compression pass for web performance.

## 5. Consistency Controls
- Prompt templates with locked style anchors.
- Reference board frozen per release.
- Seed tracking for reproducibility.
- “Reject” rules for off-style results.

## 6. Production Risks & Mitigations
- Risk: style drift. Mitigation: stricter prompt scaffolds + review gate.
- Risk: unreadable UI overlays. Mitigation: map/UI contrast checks.
- Risk: legal ambiguity. Mitigation: model/tool licensing checklist.
