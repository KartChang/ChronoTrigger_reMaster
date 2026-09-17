# GitHub Pages development preview

The user explicitly authorized a public GitHub Pages showcase on 2026-09-17. This is a development preview, not a commercial/official release or an override of the 90-point completion gate. Repository visibility is not changed. ROM, original reference image bytes, soundtrack, secrets and source archives are not published by this workflow.

## One-time repository setting

At inspection the GitHub repository reported `has_pages:false`. The installed connector has source/Actions access but no Pages configuration write action. The official actions/configure-pages@v5 input specification states that enablement requires a token other than GITHUB_TOKEN; a workflow must not pretend that pages:write alone grants administrative creation rights.

Open https://github.com/KartChang/ChronoTrigger_reMaster/settings/pages and choose **Build and deployment > Source > GitHub Actions**. Then open **Actions > GitHub Pages preview > Run workflow** once. No personal access token, custom domain, paid host or repository-visibility change is needed. The workflow also checks this setting and reports `PAGES_NOT_ENABLED` with setup instructions; a successful prepare job with skipped deploy does not mean the site is live.

Expected default project URL after a successful deployment: https://kartchang.github.io/ChronoTrigger_reMaster/
Game entry is the stable relative path `./play/`. The URL must be confirmed from deploy-pages output and public HTTP checks, not assumed live merely because the workflow file exists.

## Automated update rules

`pages.yml` starts after a successful Playable prototype CI, when publishing files change, or on manual dispatch. It selects the latest successful main run from this repository, rejects fork/PR/wrong-workflow runs, then downloads the unique nonexpired `chrono-hd2d-playable` artifact. It verifies metadata SHA/byte count, file allowlist and artifact provenance; it does not rebuild a different copy of the game or execute artifact code.

Only the tested HTML and its metadata/quality/notices are copied to `play/`. The launcher at the project root is separate. Deployment metadata includes CI number, exact source SHA, artifact ID/digest and the HTML SHA256. Paths are relative for project-site compatibility. Source files, evidence tarballs, art references and ROMs cannot enter the staged directory through this packager.

The prepare job has read-only contents/actions/pages permissions. Only the deploy job receives pages:write and id-token:write, uses the github-pages environment and official upload-pages-artifact/deploy-pages actions. Workflows are serialized and do not cancel current validation. Each new event selects the latest successful run rather than blindly redeploying its potentially old triggering run. Expired/missing artifacts stop rather than silently using an arbitrary older package.

After deployment a bounded public HTTP check verifies the manifest source and exact HTML hash. This confirms deployment bytes and reachability, not iOS/Android, physical gamepad, full-game fidelity or browser performance.

## Save transfer and player disclosure

The public launcher clearly identifies an unfinished nonofficial fan project. Current story boundaries and pending systems are visible. It contains no login, upload service, analytics or external font.

file:// and the HTTPS site do not automatically share IndexedDB. Export JSON from the earlier standalone game, enter the web game, import it, verify progress and save locally. Versioned formats remain v1-v4. There is no cloud synchronization; browser data deletion, a different browser or a different device can lose local progress without an export. Future hosted builds keep the same play path; no service worker cache is introduced in this pass.

## Tests and references

`node --test tests/pages-package.test.mjs` covers accepted/rejected run authority, SHA/size mismatch, artifact allowlist, symlinks, stale staging, exact bytes, missing digest and project-relative URLs. `stagePages` was also tested against actual CI10 artifact 10501060260, not only fixtures.

Official references checked on 2026-09-17:
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/rest/pages/pages
- https://github.com/actions/configure-pages/blob/v5/action.yml

Current execution state and any deployment URL belong in STATUS.md, not a duplicated live tracker here.
