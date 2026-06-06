---
type: asset-design-plan
area: sprites
status: active
priority: P1
tags:
  - POTATO
  - sprites
  - image-generation
---

# Sprite Design Logic

Backlink: [[POTATO]]

## Purpose

Sprites are not decoration. They help the player remember staff roles, trust relationships, and institutional voices. The sprite system should be deterministic enough for replay and expressive enough for future image-generation.

## Current State

The engine currently generates advisor portrait SVGs from deterministic portrait specs in `@brass-ledger/shared`. This is a good foundation because the sprite spec is serializable and reproducible.

## Sprite Contract

Recommended engine output:

```ts
type SpriteSpec = {
  id: string;
  subjectType: "chief" | "staff" | "event" | "program";
  role: "S1" | "S2" | "S3" | "S4" | "S5" | "training";
  displayName: string;
  silhouette: string;
  palette: string[];
  uniform: string;
  expression: "calm" | "skeptical" | "strained" | "urgent" | "resolved";
  trustBand?: "strained" | "watchful" | "steady" | "solid";
  prompt: string;
  negativePrompt: string;
  deterministicSeed: string;
};
```

## Visual Language

| Staff function | Shape language | Palette cue | Expression bias |
| --- | --- | --- | --- |
| S1 Personnel | rounded shoulders, grounded stance | muted green | protective, concerned |
| S2 Intelligence | narrow framing, sharper contrast | cool blue | skeptical, precise |
| S3 Operations | square posture, forward lean | brass/amber | direct, impatient |
| S4 Logistics | broad base, practical uniform detail | clay/red-brown | methodical, constraint-aware |
| S5 Plans | composed silhouette, cleaner lines | muted indigo | strategic, reserved |

Training can use teal accents internally, but player-facing sprite language should usually attach training concerns to S1, S3, or S5.

## Prompt Language

Base prompt pattern:

```text
Military staff advisor portrait for a strategic command simulation, [S-function role], [display name], [temperament], [expression], restrained editorial game art, clean bust portrait, readable at small size, consistent uniform silhouette, muted palette, no photorealism, no fantasy armor, no weapons, neutral command-room background.
```

Negative prompt pattern:

```text
photorealistic, cinematic glow, fantasy armor, tactical weapon pose, exaggerated emotion, glossy sci-fi suit, decorative background, cluttered medals, text, logo, watermark, distorted face, extra limbs
```

## State-Driven Variants

Sprite variants should be generated or selected from state:

| State | Sprite effect |
| --- | --- |
| Trust low | cooler expression, guarded brow, less open posture |
| Trust high | calmer expression, open posture |
| Directorate overloaded | strained expression, darker background |
| Campaign ended won | resolved expression |
| Campaign ended lost | severe expression, reduced saturation |
| S2 low confidence | harsher shadow or cropped framing |
| S4 bottleneck | visible utilitarian support detail |

## Input Sources

Sprite generation should consume:

- chief archetype
- S-function
- relationship/trust band
- current directorate burden
- campaign status
- deterministic session seed

It should not consume browser layout state.

## Output Strategy

Stage 1:

- Keep deterministic SVG portraits.
- Rename data model toward `SpriteSpec`.
- Add prompt text output next to SVG.

Stage 2:

- Add optional bitmap generation from `SpriteSpec`.
- Cache generated bitmap assets by deterministic seed and prompt hash.

Stage 3:

- Add sprite sheets or bust variants for common states.
- Keep save files storing specs and asset ids, not large image blobs.

## Quality Rules

- Sprites must remain readable at 48px.
- Each S-function must be distinguishable without relying only on color.
- No generated text inside images.
- No weapon-centric imagery.
- No photorealistic real-person likenesses.
- Same chief must remain recognizable across state variants.
