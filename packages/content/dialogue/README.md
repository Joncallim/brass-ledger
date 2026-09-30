# Brass Ledger Dialogue Source

This folder holds authored dialogue source.

Current character authority:
- `Brass Ledge Documentation/GROCER/POTATO/41-OFFICER-STYLE-BIBLE.md`

Current style-validation report:
- `Brass Ledge Documentation/GROCER/POTATO/42-OFFICER-DIALOGUE-STYLE-VALIDATION.md`

The first roster uses one officer/mode bundle:

```text
officers/<officer-id>/interview/core.md
```

Each file uses `schema: brass-ledger-dialogue-bundle-v1` and contains stable `## sequence:` and `### beat:` blocks.

The parser/compiler is owned by GitHub issue #113. Until that compiler lands, these files are canonical authored source but are not yet runtime-loaded.


## Presentation profiles

The style bible now defines a distinct information-presentation profile for every officer.

This is **orthogonal** to beat function:

- `function` says what an authored beat contributes to an answer, such as `position`, `reason`, `example` or `qualification`;
- the presentation profile says how that officer normally orders information when several beats are composed.

The current `interview/core.md` files were written as controlled voice fixtures and intentionally share the same two-beat function skeleton across officers. They must not become the final runtime composition grammar unchanged.

Issue #113 owns the compiler representation. It should provide a validated profile/recipe reference rather than teaching the runtime twenty-four officer-specific branches. Issue #115 owns deterministic answer composition.

Required behaviour:

- officer identity selects the presentation profile through the dialogue profile;
- cross-posting changes content/context, not the person's default information order;
- normal and compressed/under-pressure recipes are supported;
- an authored sequence may deliberately invert the default, such as starting with an example;
- short answers may omit moves;
- missing optional moves fall back deterministically;
- profile/recipe metadata is presentation-only and cannot affect simulation mechanics;
- no global `position → reason` fallback may erase officer-specific composition.

Rules:
- plain English;
- prose never defines mechanics;
- beat ids carry semantic identity;
- copy edits must not reshuffle beat selection;
- no hidden state paths or executable expressions;
- do not duplicate finished prose in TypeScript;
- interview core files are baseline voice material, not the final variation pool.
