# ChronoTrigger reMaster — HD-2D browser reconstruction

**Development in progress; not a completed game or90-point accepted release.**

Current implementation/CI: [STATUS](docs/STATUS.md). Next tasks: [TODO](docs/TODO.md). Cloud files and receipts: [DELIVERY_INDEX](docs/DELIVERY_INDEX.md). Immediate handoff: [IMMEDIATE_CONTINUATION](docs/handoff/IMMEDIATE_CONTINUATION.md).

## Current batch

0.8 adds the trial, alternate prison escapes, Fritz, Dragon Tank, reunion and2300 arrival to the existing waking/fair/600-year/cathedral journey. Inventory/ether/XP are partial systems, not full equipment/growth. New Crono, Marle, Lucca and Frog are native48x64 pixel redraws connected to gameplay, not enlarged old sprites. See [actual asset scope](docs/HD_PARTY_ASSETS.md) and [trial scope/gaps](docs/TRIAL_T03.md).

415 local tests, typecheck/build passed; final same-source browser acceptance remains pending until STATUS records it. Last verified public deployment is0.7.0 fromCI13/Pages6, not automatically the newest source. Existing preview: https://kartchang.github.io/ChronoTrigger_reMaster/ .

## Development

```sh
npm ci
npm run check
npm run preview
```

The built dist/index.html is self-contained. TypeScript/Babylon.js/esbuild, browser-first, fixed-step ATB and local two-player support are retained. P1 Crono; Lucca returns to P2 when story allows; Frog/Marle may be autonomous third companion. This is not a new real-time ARPG or network-multiplayer implementation.

Save v1–v7 compatibility and actual earlier-choice provenance are retained. Browser tests use genuine input and same-run exported saves, not direct state injection. The full nine-journey CI and exact-source Pages packaging remain under .github/workflows.

## Original fidelity and assets

Full original geography, court witnesses/jury rules, character/skill progression, remaining eras/endings, art/audio and physical-device verification are incomplete. Four new atlases do not mean all assets are remade. Larger texture dimensions and unit-test counts are not a quality score. The old30-point review is stale; whole-game>=90 is not accepted.

Original ROM is privately retained in the project Drive at the user's request, not included or required for play. It has not been emulated/extracted in this batch. No original image/audio binaries are publicly packaged. Authored derivative character drawings do not establish original-IP rights clearance. References/provenance are in assets/reference-index.json and docs/ORIGINAL_FIDELITY.md; dependencies/notices in docs/THIRD_PARTY.md.

GitHub main is source/progress authority; source, generated PNG/JSON and validation packages are permanently retained in the project Drive. Do not use temporary containers or historical ZIPs to overwrite newer main. Stable agent instructions:AGENTS.md; implementation map:CODEBASE.md.
