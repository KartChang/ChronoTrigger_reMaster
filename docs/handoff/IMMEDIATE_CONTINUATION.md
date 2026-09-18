# Immediate continuation — interrupted 0.8.2 recovery

## Latest interruption checkpoint — 2026-09-18

Main was freshly read as `06a690ebec0ad55cc5c056440fb352a50c368266`, the documentation-only acceptance/recovery commit. The last tool call before the second interruption was successful: it created staging tree **`9e4feb71119d5f6bcb61398408af1fa92d56df53`**. This exact tree was fetched successfully again while recording this checkpoint. It is NOT yet a gameplay commit on main, NOT a tested final candidate and NOT a deployed keyboard fix. This later [skip ci] handoff edit does not publish that staging tree.

Staged subtrees: src `d0812c9a39c91b5acd679d9b3b1bf285b25617d4`, tests `c4b6b7c7d2e4d97f97e3d097f253a60b645b8d0b`, scripts `7178a0de26d7105056d60a36817afb941afc0a0f`, .github `8951dee945c52926fd46047e34e72481866df985`, site `c9f90cb47a4c8f11c51dab0f004d0ba49334c632`; index.html blob `68c20971f153a23a4c36824e5da38f436a26ba00`. Use these to resume the existing upload, not repeat every successful write. The staging tree also retains older asset/docs entries; reconcile only the pending batch files rather than assuming publication is complete.

The visible failure is a generic thinking-failed/interruption. No platform exception code, stack trace or session-termination diagnostic is available. Earlier GitHub422 responses said referenced blob IDs did not exist; subsequent writes containing actual file contents succeeded. Those recoverable API errors do not establish the cause of the later platform interruption. A locally computed SHA is not proof that GitHub already stores the object.

Next execution: recover current main as baseline; use the matching working archive below and the latest staged changes, especially input ownership and palette fixes. Compare only this batch's files, finish missing content and tests, run the integrated local check, then complete commit -> non-force main update -> readback. Do not spend another turn retransmitting already stored full files or rebuilding accepted chapters. The historical498-pass recovery result does NOT certify the later9e4feb staging tree. Keep gameplay acceptance pending until the final integrated tree and actual browser journeys pass.

Development remains batched; persistence must be bounded. A checkpoint is not complete until a real main commit/readback and a durable source/delta receipt exist. Use [skip ci] for intermediate validated work checkpoints when needed; trigger one non-skip CI for the complete batch, not one per small fix. Do not manufacture or dispatch a new CI for this documentation edit. Once the actual batch CI is pending, preserve exact source/run/job and report without prolonged polling.

## Existing task and recovery source

Read STATUS and continue existing work; no history audit or other-project rules. Main only/non-force. CI15/source `2a689fe5abc76d865bc15bc948a43f9738bd6650` is SUCCESS with all three jobs; Pages8 verified0.8.1. No0.8.2 validation or deployment is claimed.

Current task is finishing and publishing the user's keyboard regression and pixel animation batch. Verified recovery package: Drive `1_Tc_Syw6pxGSZDvEGUwObeHvos8TeKnF`, project parent `1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb`, SHA256 `be2258ee36a1d0897b55333ad0023b407d8161fc9890890781bdf8875ad37463`,1780760 bytes,38 changed files/164 manifest members. It matches base `02cdd87ee335dcb10933bca9b3ca613444096e0f`; it is a changes package, not permission to overwrite newer main or latest staged edits. Prior recovery check498/498 passed. Newer input/palette changes require fresh integrated validation.

Retain all prior assertions and journeys; the new keyboard path uses real input, no manufactured saves/state. No new local browser screenshot, physical-device, final-art or90-point acceptance is claimed by recovery. The full game scope and original fidelity goals stay open, including T03 exact rules/topology, T04 systems, T05 full assets/animation/music and T06 remaining story.

## Permanent preservation

CI15/Pages8 bundle `1AKR6UJGdOB0fxzW6trUTlCdpbmuPwel6` contains all6 intact artifact ZIPs and manifests; prior outer/inner bytes/hashes verified. See evidence/CI15_ACCEPTANCE.md. No repeat upload is needed. ROM `1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM` stays private in the project folder; not yet emulated/extracted. Never put ROM/original assets in public source/CI/Pages. All future deliverables belong inside the project folder, never Drive root. Temporary container contents are not authority.
