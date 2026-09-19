# Vighnaharta — provenance and dependencies

Updated 13 September 2026. This is a working provenance record, not a certification of contest compliance or a complete license audit. No external game code, new generated assets, samples, or recordings were imported during the documentation redesign.

## Existing artwork records

The earlier project record describes the following as project-specific generated artwork. Those statements are retained as inherited provenance; original generation receipts and source rights have not been independently reverified in this pass.

| Asset/family | Inherited record | Current production treatment |
| --- | --- | --- |
| `public/assets/festival-journey-map.png` | Generated using OpenAI ImageGen for the six-district journey. | Existing painted-map reference; current GameScene uses it. Interactive world will be assembled from separate assets. |
| `public/assets/district-night-v2.png` | Generated as an isometric night festival district. | Existing background/style reference. |
| `public/assets/mooshak-scout.png` | Generated Mooshak character in saffron clothing. | Identity reference and candidate single pose; not a complete animation set. |
| Shrine, devotees, buildings, trees, barricade, roads and rangoli PNGs | Supplied as generated artwork and previously processed with `process_assets.py`. | Inspect individually before reuse; keep originals and version new derivatives. |

Other files in the asset directory, including `city-expansion.jpg` and numbered JPEGs, require individual provenance/usage review before final inclusion. Do not infer rights from a filename or assume that every file is currently loaded.

## Runtime dependencies

The project package declares Phaser, React/React DOM, Zustand, MediaPipe Tasks Vision, Vite, TypeScript, Tailwind, PostCSS, Autoprefixer, the Vite React plugin, ESLint, and type packages. Exact installed versions and notices should be recorded from the lockfile and distributed packages when preparing a release.

MediaPipe runtime/model files are present under `public/mediapipe`; prior records identify the runtime as Apache-2.0. Check notices for both runtime and model distributions before shipping. The redesign reserves hand tracking for optional post-completion play.

Previous typography records identify Cinzel and Inter as SIL Open Font License fonts. Verify actual distributed font files and retain applicable notices at release.

## Audio

Inspected current code uses Web Audio procedural synthesis, including interval-driven festival accompaniment. The redesign calls for advance-scheduled backing music and four distinct live percussion voices. It does not mean the existing audio has already been rebuilt or audited.

Future samples, music stems, or chants need their exact source, creator, license/permission, attribution, modifications, and included files recorded here or in the asset manifest. Web Audio is the playback/timing system; it is not provenance for recordings. Original synthesis and recorded assets must be distinguished.

## Research references are not shipped assets

The gameplay document links to Candy Crush, Fruit Ninja, Taiko, Crossy Road, Flow Free, Phaser examples, and an audio/physics reading list for design research. Their inclusion in the design does not import their code, characters, audio, or artwork into the game.

The Phaser examples repository distinguishes its MIT source code from its assets. Check each proposed reuse and preserve its applicable notice. The former bubble-shooter candidate was removed from the active plan when the user selected flower match-3. No candidate repository has been integrated in this pass.

## New production records

Follow [the asset workflow](docs/ASSET_PRODUCTION.md). For every accepted generated asset, record its versioned project path, reference image, prompt, generation method, changes, and review status. For every imported asset/code package, record exact source and applicable rights/notices. Do not mark planned or rejected candidates as shipped.

- `public/assets/v2/mooshak/mooshak-run-sheet-source-v1.png` and prepared `mooshak-run-sheet-v1.png` were generated with the built-in image-generation tool using `public/assets/mooshak-scout.png` as the identity reference. Prompt, preparation, dimensions, integration, and limitations are recorded in [the asset manifest](docs/assets/mooshak-run-sheet-v1.md). It is an integrated draft pending motion review.

[Earlier attribution record](docs/archive/2026-09-13-before-consolidation/ATTRIBUTIONS.md) preserves the previous claims and descriptions for traceability; it is historical context.
