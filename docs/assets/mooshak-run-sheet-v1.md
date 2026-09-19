# Mooshak run sheet v1

- Status: integrated draft; generated and prepared 13 September 2026.
- Identity reference: `public/assets/mooshak-scout.png`.
- Generated source: `public/assets/v2/mooshak/mooshak-run-sheet-source-v1.png`.
- Prepared runtime sheet: `public/assets/v2/mooshak/mooshak-run-sheet-v1.png`.
- Method: built-in image-generation tool, followed by connected-background removal with `tools/prepare_generated_sheet.py`.
- Layout: 4 columns × 2 rows; 443×443 pixels per frame; 1772×886 total.
- Phaser key/animation: `mooshak-run-v1` / `mooshak-run`, 12 fps looping.
- Current display scale: 0.22 in `GameScene`.
- Ground anchor: sprite origin `(0.5, 0.88)`; Arcade footprint `185×105` source pixels. These values require visual playtest and may be retuned.

## Generation prompt

Use the supplied Mooshak sprite as the identity reference. Preserve the charcoal-grey fur, large ears and eyes, saffron-orange embroidered waistcoat, marigold ornament, gold trim and bell collar. Create a clean 4×2 sheet containing eight full-body poses for a continuous grounded run facing bottom-right in an orthographic 2.5D isometric view. Keep proportions, costume, camera, scale, lighting and ground-contact position consistent. Warm top-left key light, cool indigo rim light, transparent background, no ground or cast shadow, text, grid, scenery, extra props or duplicate limbs.

## Known limitation

The generation output contained a visible checkerboard as RGB pixels rather than alpha. The preparation script removed connected bright neutral backdrop pixels and produced RGBA output. The animation still needs in-browser checks for frame-to-frame identity, tail/whisker clipping, foot sliding, and visual jitter. Do not treat it as final character art until those checks pass.
