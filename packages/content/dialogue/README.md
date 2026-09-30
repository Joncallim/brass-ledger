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

Rules:
- plain English;
- prose never defines mechanics;
- beat ids carry semantic identity;
- copy edits must not reshuffle beat selection;
- no hidden state paths or executable expressions;
- do not duplicate finished prose in TypeScript;
- interview core files are baseline voice material, not the final variation pool.
