# AutoBucket review fixes and dependency update (2026-10-05)

## Workspace
- Original: `/Users/a-tak/GitHub/auto-bucket`, clean master at `2f3e0f4` before/after work.
- Remote: `https://github.com/a-tak/auto-bucket.git`.
- Dedicated actual Git worktree: `/Users/a-tak/Documents/Codex/2026-10-05/task-2/autobucket-review`.
- Branch: `fix/review-dependencies-20261005`; common Git directory: `/Users/a-tak/GitHub/auto-bucket/.git`.
- No repository/ancestor AGENTS.md or repository .agents directory found. Relevant local memory reviewed; no AutoBucket-specific instructions.
- Initial validation and manual-test phase used1.3.1 with no commit/push/publication. After the user reported no issues and explicitly approved GitHub Release/ATN submission, release preparation advances to1.3.2. This report records the initial validation plus follow-up findings.

## Review fixes
- Remove unused unlimitedStorage.
- Replace extension.getURL with runtime.getURL.
- Replace messages.listTags with messages.tags.list; update tests and supplement the old published Thunderbird type definitions.
- Request messagesTagsList explicitly for current Thunderbird API permissions (documented in the current MV2 API and verified in local TB154 schema). Official MV2 permission documentation and annotated schema both mark messagesTagsList as added in TB122, so the declared minimum version is supported by specification; actual runtime testing remains outstanding.

## Migration checks
- React19: existing createRoot and react-jsx transform compatible; align react-dom and both React type packages.
- MUI5 → 9: migrate renderTags/getTagProps to renderValue/getItemProps and InputProps to slotProps.input; regression test chip removal and unit adornment. MUI9 browser baseline Firefox121 is below declared Thunderbird122. Visual comparison on Thunderbird remains outstanding.
- i18next23 → 26/react-i18next14 → 17: no removed legacy format/initImmediate options; existing Japanese regional locale and English fallback tests pass; target Gecko supports Intl.
- p-map4 → 7: project is already ESM; concurrency call sites retained; classification/statistics tests pass.
- TypeScript5 → 7: remove baseUrl, use relative paths, explicitly include global Thunderbird types. Existing latest published thunderbird-web-ext-types is still 1.0.0; its API gaps are locally supplemented.
- Archiver5 → 8: migrate CJS scripts to dynamic ESM import and ZipArchive class; both archives validated.
- Husky4 → 9/pretty-quick3 → 4/Prettier2 → 3: move hook to .husky/pre-commit and prepare script. Installation used --ignore-scripts to avoid changing shared Git hook configuration; actual pre-commit invocation not performed.
- jsdom30 requires newer Node patches; update engines, CI and README to Node22.22.2/24.15+ or26+. Tested locally on Node26.3.0/npm11.16.0; Linux CI not run.
- Vitest and coverage provider updated together to5.0.3; regression suite and existing thresholds pass.
- Build syntax target explicitly firefox122. Vite native-config warning resolved via import.meta.dirname.
- Notice generator handles absent optional platform binaries; release check validates current installed production dependency versions/integrities instead of hard-coded removed html-parse-stringify.

## Versions
Official npm registry latest stable metadata was queried for every direct dependency; npm outdated returned {} after installation. Versions below are lockfile resolved versions.

| Dependency | Before | After |
|---|---|---|
| @emotion/react | 11.14.0 | 11.14.0 |
| @emotion/styled | 11.14.1 | 11.14.1 |
| @mui/icons-material | 5.18.0 | 9.4.0 |
| @mui/material | 5.18.0 | 9.4.0 |
| chart.js | 4.5.1 | 4.5.1 |
| i18next | 23.16.8 | 26.4.2 |
| p-map | 4.0.0 | 7.0.8 |
| react | 18.3.1 | 19.3.0 |
| react-chartjs-2 | 5.3.1 | 5.3.1 |
| react-dom | 18.3.1 | 19.3.0 |
| react-i18next | 14.1.3 | 17.0.15 |
| simple-statistics | 7.8.8 | 7.12.1 |
| tiny-segmenter | 0.2.0 | 0.2.0 |
| webextension-polyfill | 0.10.0 | 0.12.0 |
| @testing-library/dom | 10.4.1 | 10.4.2 |
| @testing-library/react | 16.3.2 | 16.3.3 |
| @testing-library/user-event | 14.6.6 | 14.6.7 |
| @types/node | 22.20.1 | 26.6.4 |
| @types/react | 18.3.28 | 19.3.0 |
| @types/react-dom | 18.3.7 | 19.3.0 |
| @vitejs/plugin-react | 6.0.2 | 6.1.1 |
| @vitest/coverage-v8 | 4.1.11 | 5.0.3 |
| archiver | 5.3.2 | 8.0.0 |
| cross-env | 7.0.3 | 10.1.0 |
| husky | 4.3.8 | 9.1.7 |
| jsdom | 27.0.1 | 30.1.2 |
| prettier | 2.8.8 | 3.9.9 |
| pretty-quick | 3.3.1 | 4.2.2 |
| thunderbird-web-ext-types | 1.0.0 | 1.0.0 |
| typescript | 5.9.3 | 7.0.2 |
| vite | 8.0.16 | 8.3.2 |
| vite-plugin-static-copy | 4.1.1 | Removed; Vite asset output |
| vitest | 4.1.11 | 5.0.3 |

## Validation
- npm ci --ignore-scripts: pass (clean reproducible install); npm ls --depth=0: no invalid peer dependencies.
- typecheck/typecheck:tests: pass.
- 16 test files, 63 tests pass, including new MUI tag-removal regression and tags.list mock migration.
- Coverage: statements84.37%, branches75.23%, functions91%, lines84.36%; existing configured gates pass.
- build, third-party notices, extension ZIP, source ZIP, release metadata and --check-dist: pass.
- Prettier check on touched code/config files and git diff --check: pass. No separate lint script exists.
- npm audit --omit=dev: 0 vulnerabilities. Follow-up removed vite-plugin-static-copy and its vulnerable braces/chokidar chain. Offline full audit reports 0, and npm ls/lockfile confirm all three packages are absent. Fresh online audit could not run because registry.npmjs.org DNS resolution is blocked; no additional permission requested.
- Attempted TB154 headless offline smoke with a newly-created /tmp profile and a minimal read-only API probe. Add-on registered active, but OS process/sandbox errors prevented confirmed script/API results. Full AutoBucket installation, mail actions, UI or end-to-end classification were not tested. Existing Thunderbird profiles untouched; no real messages sent, moved or deleted.
- Thunderbird122 and current Thunderbird visual/functional smoke tests remain required before release, especially MUI keyboard/focus/appearance behavior; messagesTagsList support since122 is now confirmed by official specification.

## Official references
- [Thunderbird MV2 tags API](https://webextension-api.thunderbird.net/en/mv2/messages.tags.html): tags.list introduced121; current permissions.
- [React19 migration](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [MUI7 migration](https://mui.com/material-ui/migration/upgrade-to-v7/) and [MUI9 migration](https://mui.com/material-ui/migration/upgrade-to-v9/)
- [i18next migration](https://www.i18next.com/misc/migration-guide)
- [p-map releases](https://github.com/sindresorhus/p-map/releases)
- [Archiver8 release](https://github.com/archiverjs/node-archiver/releases)
- [Husky migration](https://typicode.github.io/husky/migrate-from-v4.html)

## Follow-up: remaining audit findings resolved
- One underlying advisory: [GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), braces <=3.0.3; official advisory lists no patched version as of2026-10-05.
- Audit originally marked braces3.0.3, chokidar3.6.0 and vite-plugin-static-copy4.1.1 high because of the same chain, not three separate advisories.
- Reachability: recursive brace AST parsing/compile/expand can overflow on attacker-controlled deeply nested glob patterns. The plugin calls chokidar.watch only in its apply:serve configureServer hook. AutoBucket configured fixed _locales/icons/manifest.json paths; production/development builds and mail contents do not supply untrusted patterns to that watcher. Exposure was local development-server configuration, not packaged mail runtime.
- Safe remediation: remove copy plugin and15 associated installed packages; emit the five static files using Vite buildStart/addWatchFile/emitFile with fixed source paths. No force update, downgrade or override.
- Manifest, both locale files and both icons in the rebuilt extension ZIP compared byte-for-byte with their sources: identical. Full release pipeline still passes63 tests and both typechecks; extension/source archives validate. The custom emitter covers supported npm build/build:dev/watch scripts; there is no npm development HTTP-server script and custom plain `vite serve` resource middleware is no longer provided.
- Offline audit:0 findings; fresh online audit blocked by ENOTFOUND registry.npmjs.org. Removed vulnerable dependency graph independently confirmed through lockfile and npm ls.

## Follow-up: Thunderbird122 permission support confirmed
Official [MV2 permissions docs](https://webextension-api.thunderbird.net/en/mv2/permissions.html#optionalpermission) state messagesTagsList was added122. The [official annotated manifest schema](https://raw.githubusercontent.com/thunderbird/webext-annotated-schemas/beta-mv2/schema-files/messages.json) includes it in manifest.OptionalPermission and annotates version_added122; tags.list itself is annotated121 and requires messagesTagsList. OptionalPermission is also a permitted branch of mandatory Permission, so declaring it in permissions is supported. This resolves the specification compatibility uncertainty; no minimum-version increase needed. A frozen122 binary install/functional smoke has not been run.

## Follow-up: concrete runtime-test limitation and alternatives
The dedicated headless TB154 probe log contains `sandbox_extension_issue_file_to_process failed for .../plugin-container.app: 1 (Operation not permitted)`, `RenderCompositorSWGL failed mapping default framebuffer` and child-process channel errors. It registered the probe add-on active in the new /tmp profile but produced no verified API success or storage record. The log shows child sandbox/file-access and graphics initialization failure; it does not prove a particular missing entitlement or required OS setting. No attempt was made to disable Mozilla sandboxing, alter entitlements, change OS permissions or launch the existing profile.
Permitted completed alternatives: official versioned API annotations and installed154 schema inspection;63 unit/jsdom tests; byte-identical packaged assets and both ZIP validation; attempted Vite asset-watch verification (not confirmed; watch stopped after transform in this execution environment). These do not substitute for real Thunderbird UI/classification tests. Full runtime testing would need a supported graphical execution environment, or a human-launched isolated blank profile using the local ZIP. Any new permission/environment setting or remote setup would require a separate decision; none requested here.

## Follow-up: worktree registration rechecked
`git worktree list --porcelain` lists only the original master checkout and this dedicated fix worktree; both HEADs remain2f3e0f4d97837282d4cb836d535a3ccc2942bd4b. `.git` is a real worktree gitdir pointer to `/Users/a-tak/GitHub/auto-bucket/.git/worktrees/autobucket-review`; `git rev-parse --git-common-dir` resolves `/Users/a-tak/GitHub/auto-bucket/.git`. At that initial check no commit/push/publication, additional costs or settings changes had occurred.

Watch-mode limitation: two20-second probes stopped after654 modules transformed without a completed build. A12-second baseline probe with the custom asset emitter removed stopped at the same point. This suggests a shared Vite/Rolldown watch or execution-environment limitation; it is not evidence of an emitter-specific regression. Watch correctness remains unverified and no sandbox/settings bypass was attempted. Production and development one-shot builds both succeed.
