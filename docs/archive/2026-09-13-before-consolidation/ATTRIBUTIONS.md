# ATTRIBUTIONS & LICENSING

## New production assets and runtime

- `public/assets/festival-journey-map.png` — generated specifically for this project with OpenAI ImageGen; integrated as the six-district journey world and results backdrop.
- MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) — Apache-2.0 licensed runtime used for optional, on-device index-fingertip tracking in Air Rangoli. The WASM runtime and public Hand Landmarker model are bundled under `public/mediapipe/` so this feature does not require a runtime CDN download.

## NIAT Ganesh Chaturthi Game Design Contest — Compliance Log

All code, algorithmic audio synthesis, and procedural textures for **VIGHNAHARTA: PATH OF LIGHT** have been created specifically for this competition, respecting all intellectual property, copyright, and cultural guidelines.

---

### 1. Code & Frameworks
* **Phaser 3 Engine**: Released under the [MIT License](https://github.com/phaserjs/phaser/blob/master/LICENSE.txt). Copyright © 2024 Richard Davey, Photon Storm Ltd.
* **React & React DOM**: Released under the [MIT License](https://github.com/facebook/react/blob/main/LICENSE). Copyright © Meta Platforms, Inc. and affiliates.
* **Zustand**: Released under the [MIT License](https://github.com/pmndrs/zustand/blob/main/LICENSE). Copyright © 2019 Paul Henschel.
* **Tailwind CSS**: Released under the [MIT License](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE). Copyright © Tailwind Labs, Inc.
* **Vite**: Released under the [MIT License](https://github.com/vitejs/vite/blob/main/LICENSE). Copyright © 2019-present Evan You & Vite Contributors.

---

### 2. Audio & Sound Design
* **Zero Copyrighted Music/Samples**: In strict adherence to contest rules, no commercial, copyrighted, or recorded devotional recordings have been sampled or distributed.
* **Procedural Sound Generation**: All sound effects (UI clicks, wind whooshes, sub-bass impacts, harmonic bell chimes, and resonant Dhol beats) are generated purely in real-time through the browser's native **Web Audio API** (`OscillatorNode`, `BiquadFilterNode`, and synthesized white noise buffers).
* **Rhythm Architecture**: Implemented following Chris Wilson's Lookahead Web Audio Clock design principles (W3C Audio Working Group).

---

### 3. Typography
* **Cinzel**: Designed by Natanael Gama, licensed under the [SIL Open Font License, Version 1.1](https://scripts.sil.org/OFL).
* **Inter**: Designed by Rasmus Andersson, licensed under the [SIL Open Font License, Version 1.1](https://scripts.sil.org/OFL).

---

### 4. Cultural & Thematic Integrity
* Depiction of Lord Ganesha adheres strictly to respectful iconography principles: the deity is represented as a dignified, radiant central procession shrine and is never subject to combat, collision damage, or comic distortion.
* Obstacles are environmental and logistical (*Vighnas*), highlighting Lord Ganesha's revered role as the remover of obstacles.

---

### 5. Original Visual Assets

The procession shrine, devotees, festival street diorama, decorated buildings, temple, trees, barricade, and rangoli street art in `public/assets` were supplied with the project as original generated artwork for this game. They were locally background-removed and cropped with `process_assets.py`; no third-party game art or unlicensed web imagery is included. Procedural roads, lane marks, lights, rain, particles, warnings, and route-reveal graphics are generated at runtime by the game code.

`public/assets/district-night-v2.png` was generated specifically for this project with OpenAI's built-in image generation mode. The locked prompt requested a single cohesive 16:9, premium 2.5D/isometric Indian festival district at night: deep indigo, wet asphalt, warm diya and marigold light, a readable bottom approach, central barricade junction, left shortcut, straight safe route, and right festival route; no text, logos, UI, deity imagery, or external reference images were used.

`public/assets/mooshak-scout.png` was generated specifically for this project with OpenAI's built-in image generation mode. The prompt requested a dignified, fast and clever charcoal-grey Mooshak in a saffron festival waistcoat, rendered as an isolated transparent 2.5D isometric game sprite under matching warm top-left diya light and cool indigo rim light. No external references, logos, text, weapons or scenery were used.
