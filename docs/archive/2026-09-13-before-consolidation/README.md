# VIGHNAHARTA: PATH OF LIGHT

> **Current status: prototype under gameplay redesign.** Start with [the six-game design proposal](docs/GAMEPLAY_REDESIGN.md) for the researched gameplay direction, road and NPC rules, camera, animation, audio, assets, and implementation gates. This September 2026 design pass changes documentation only. Historical “production release,” testing, and support claims below are not verified release evidence; current runtime behaviour also differs from parts of this older README.

> **A Competition-Grade Ganesh Chaturthi Procession Game**  
> Built for the **NIAT Ganesh Chaturthi Game Design Contest**  
> Optimized for: *Fun & Playability*, *Creativity*, *Completeness*, *Ease of Use & Look*, *Technical Quality*, and *Thematic Integration*.

---

## 1. Game Concept

In **VIGHNAHARTA: PATH OF LIGHT**, the player guides a sacred Ganesh Chaturthi procession through an isometric Indian city illuminated by the night sky and festive diyas. 

The player controls **Mooshak**, Lord Ganesha's quick and clever companion, running freely ahead of the procession through a scrolling isometric festival city. The procession remains dignified and protected while Mooshak physically clears logistical and environmental Vighnas.

* **Run Ahead**: Move and dash across five connected city districts while the procession advances behind you.
* **Clear Living Vighnas**: Push carts, relight diyas, redirect crowds, open an ambulance corridor, isolate live wiring and restore dhol rhythm.
* **Prioritize Under Pressure**: Multiple problems remain active while the procession arrival clock keeps moving.
* **Build Seva Chains**: Consecutive solutions multiply score and preserve Festival Spirit.
* **Help the City**: Solved tasks determine which districts and helpers appear in the finale.

---

## 2. Why "Vighnaharta"?

*Vighnaharta* is one of Lord Ganesha's most revered titles: **The Remover of Obstacles**. 

In gameplay, this is directly translated into player verbs:
* Obstacles are designated as **Vighnas**—temporary logistical and environmental challenges rather than physical violence or injury.
* The procession radiates divine light, transforming dark, congested city lanes into vibrant, illuminated routes.
* Near-miss dodges trigger **CLUTCH** moments: time momentarily dilates, a sub-bass resonance strikes, and divine momentum surges forward.
* The finale culminates in the reverent chanting phrase: **"GANPATI BAPPA MORYA"**.

---

## 3. Controls & Cross-Platform Input

The input system supports touch, keyboard, and mouse gestures with sub-100ms response times.

### Desktop, Mobile, and Tablet

* **Move:** `WASD`, arrow keys, or click/tap a destination.
* **Dash:** `Shift` or `Space`.
* **Interact faster:** hold `E` while standing inside a Vighna ring.
* **Sequence tasks:** touch the numbered world markers in order.
* **Rhythm task:** tap `E` on four gold pulses.

---

## 4. Scoring System

The scoring architecture utilizes additive bonuses with controlled, bounded multipliers to reward **Speed + Skill + Style + Risk** without exponential inflation:

| Action / Event | Base Score | Multiplier Impact |
| :--- | :--- | :--- |
| **Base Junction Clear** | +100 pts | Multiplied by active Flow |
| **Good Rhythm Turn** | +40 bonus | Multiplied by active Flow |
| **Perfect Rhythm Turn** | +120 bonus | +1 Combo, +15 Flow Meter |
| **Hazard Dodge** | +50 pts | Maintains procession pace |
| **Clutch (Near-Miss)** | +400 pts | +25 Flow, triggers time-dilation |
| **Shortcut Discovered** | +250 pts | Saves journey time, +20 Flow |
| **Festival Node Visit** | +200 pts | +10 Flow Meter |
| **Geometric Rangoli Formed** | +1,500 – +5,000 pts | Route geometry completion |
| **Temple Destination Arrival** | +5,000 pts | End-of-run completion bonus |
| **Route stall / blocked street** | Time loss | Flow breaks; draw another way |

### Multipliers & Flow Rules
* **Festival Flow (Max Meter)**: Awards a flat **×1.5** multiplier for 8 seconds.
* **Risk Gates**: Imparts a **×2.0** or **×3.0** multiplier bounded to the subsequent section (10 seconds), preventing retroactive score runaway.
* **Combo Multiplier**: Increments on consecutive rhythmic perfection and clutches; resets safely upon contacting a Vighna.

---

## 5. Technology Stack

* **Game Engine**: [Phaser 3.87.0](https://phaser.io/) (WebGL 2 / Canvas, Arcade Physics, Custom Cameras, Particle Emitters).
* **UI & Component Layer**: [React 18.3.1](https://react.dev/) + [TypeScript 5.6](https://www.typescriptlang.org/).
* **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) with a curated festival palette (Deep Indigo, Warm Gold, Marigold, Vermilion, Muted Teal).
* **State Management**: [Zustand 4.5](https://github.com/pmndrs/zustand) for decoupled, zero-latency reactive state and persistent `localStorage` Personal Bests.
* **Audio Engine**: Custom Web Audio API procedural synthesis with Chris Wilson Lookahead Scheduling Clock (zero asset latency, no external copyright risks).
* **Build Tool**: [Vite 5.4](https://vitejs.dev/) with automated Rollup vendor chunking (`phaser` segregated from UI bundle).

---

## 6. How to Run Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18+ or 20+ LTS recommended)
* `npm` (bundled with Node.js)

### Installation & Launch
```bash
# 1. Clone or navigate to the repository root
cd vighnaharta

# 2. Install dependencies
npm install

# 3. Start development server with Hot Module Replacement
npm run dev

# 4. Open in browser at:
# http://localhost:3000
```

### Production Build & Preview
```bash
# Typecheck & build production bundle into /dist
npm run build

# Preview production build locally
npm run preview
```

---

## 7. Accessibility Features

* **Reduced Motion**: Disables camera trauma shake, pulse zooms, and intense screen shakes for motion-sensitive players.
* **High Contrast Mode**: Amplifies road outlines, lane markers, and Vighna boundaries with distinct luminance borders.
* **Multi-Modal Telegraphing**: Hazards are communicated via color, geometric shape, directional warning animations, and audio cues simultaneously (never relying on color alone).
* **Custom Volume Sliders**: Independent sliders for Music and SFX/Percussion plus a global Instant Mute.
* **Device Independence**: Fully responsive canvas scaling (`Phaser.Scale.RESIZE` + `FIT`) with touch-action isolation to prevent accidental browser refresh gestures on mobile.

---

## 8. Supported Browsers & Devices

| Platform | Primary Tested Browsers | Status |
| :--- | :--- | :--- |
| **Desktop / Laptop** | Google Chrome, Mozilla Firefox, Microsoft Edge, Safari (macOS) | Fully Supported (60 FPS) |
| **Android Mobile** | Chrome for Android, Samsung Internet | Fully Supported (Touch & Haptics) |
| **iOS Mobile** | Safari iOS (iPhone / iPad), Chrome for iOS | Fully Supported (Silent Buffer Audio Unlock) |

---

## 9. Team & Contest Submission

* **Contest**: NIAT Ganesh Chaturthi Game Design Contest
* **Game Title**: VIGHNAHARTA: PATH OF LIGHT
* **Version**: 1.0.0 (Production Release)
