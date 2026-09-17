# T02 implementation batch — 0.7.0, browser acceptance pending

Based on current verified gameplay `2eec00c4a9e74c7873724217bd14f5087c42acf0`, whose later documentation-only main HEAD is `158fdc83e7701034186e67e4446368f52a1bd03e`. This is an additive source batch, not reconstruction from a historical delivery archive.

Implemented: three cached scene roots (bedroom, downstairs, regional 1000 AD overworld); separate scale/camera/collision and confirmed map entrances; curtain/waking and collision poses; first-meeting pendant and invitation choices; no early active P2; retained checkpoint entries; v6 whitelisted provenance with v1–v5 unchanged; 2 new exported runtime textures (28 PNG/JSON review pairs total). Existing ATB, rescue route and source-of-truth logic are reused.

T01 residual: battle recovery-message positioning now follows actual party-panel height. The existing real Yakra/tonic browser journey adds desktop and portrait bounding-rectangle checks, without fabricating text, changing battle state or removing assertions.

Local validation: `npm run check` passed, including 292 Node tests, TypeScript, asset hygiene, quality-status generation and self-contained HTML build. `python -m py_compile tests/prologue_browser.py tests/rescue_browser.py` passed. The local browser navigation to the test origin returned `net::ERR_BLOCKED_BY_ADMINISTRATOR`; no workaround was attempted, and no new local browser pass or gameplay screenshot is claimed. GitHub CI is the designated browser acceptance environment.

New browser journey `tests/prologue_browser.py` runs before all seven retained journeys. It uses only keyboard/buttons/save/import UI; `__CHRONO_TEST__` is read-only observation. It records actual fresh-game home/overworld/collision/companions/canyon screenshots, both first-choice orders, explicit refusals, pause during choices, P2 ownership and v6 exports. Reports include first failure, waits and lastObserved. Existing rescue journey records feedback geometry after a real recovery-item use.

See `ORIGINAL_FIDELITY.md` and `assets/reference-index.json` for observed original sources, applied distinctions and unresolved fidelity gaps. No new original-image/audio/ROM files are included. 0.7.0 is a candidate until exact CI evidence is inspected; it is not a 90-point or full-game release.
