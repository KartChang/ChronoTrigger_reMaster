# Third-party dependencies and asset provenance

- @babylonjs/core 8.0.0 — Apache-2.0, https://github.com/BabylonJS/Babylon.js . Rendering engine. Copyright the Babylon.js contributors.
- TypeScript 5.8.3 — Apache-2.0, https://github.com/microsoft/TypeScript . Build-time compiler.
- esbuild 0.25.0 — MIT, https://github.com/evanw/esbuild . Build-time bundler.
- Playwright Python 1.51.0 — Apache-2.0, https://github.com/microsoft/playwright-python . Test-only browser automation.

The distributable must include the Babylon.js Apache license text alongside index.html. Existing legal comments are retained by the bundler. See npm packages for complete notices and licenses.

All village geometry, procedural textures, pixel characters, placeholder enemy graphics, example dialogue and synthesized beeps are authored in this project. No uploaded ROM, ripped sprite sheet, original soundtrack, copyrighted scene dump or external font file is included. The project title refers to the intended subject and does not assert publisher affiliation or permission.

Technical references: https://doc.babylonjs.com/ , https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API , https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API .

VQ02A audio addition: src/music-score.ts contains seven short project-authored note arrangements, not original-game soundtrack transcriptions or extracts. src/scene-audio.ts synthesizes them with native oscillator/gain nodes; no recorded samples, original audio files or new third-party dependency are distributed. This describes production provenance, not soundtrack completeness, publisher affiliation or listening-quality approval. See AUDIO_T05.md and STATUS for the separate validation state. This notice was expanded in the documentation-only commit after the VQ02A source publication; that source's CI artifact carries the notice available in its exact source commit, not this later document revision.
