# Vighnaharta — implementation status

Updated 13 September 2026. This separates implemented behaviour from the larger production target.

## Integrated now

- Six independent chapter modules: Road Rally, Modak Catch, Flower Festival, Dhol Utsav, Monsoon Crossing, and Rangoli Lightworks.
- Action-based game 1; game 2 has honest catch/husk rules and completion; game 3 has adjacent swaps, complete cascades, four-match line specials, T/L bursts, five-match lotus specials and special-to-special activation; game 4 has immediate D/F/J/K instrument voices plus backing music and visible note timing; game 5 has moving safe cells, checkpoints and rescues; game 6 has editable paths, a shared raised crossing and a three-light release.
- Stage rules and completion checks use matching displayed targets; partial timeout is no longer silently awarded Gold.
- A code-authored road corridor constrains Mooshak pointer/keyboard travel. The visible road and constraint use the same centreline.
- Procession members sample individual trailing positions, tangent direction and lateral slots from route history rather than moving as a fixed rectangular group.
- Chapter completion adds a persistent gate, filled baskets, garland arch, percussion props, bridge, or lamps in the Phaser world.
- The finale receives the actual journey path and waits for a farewell action before showing the result.
- The existing Mooshak identity image was used with the built-in image-generation tool for an eight-frame run-sheet draft. The checkerboard output was converted to alpha, versioned, documented and loaded as a Phaser animation.

## Verified in this pass

- TypeScript and Vite production build passed after integration.
- Local browser reached the menu, started the journey, found chapter 1, displayed instructions, ran Road Rally, completed it, advanced to Modak Catch, rendered active catches, and showed no uncaught application error.
- Browser inspection found a repeated React key warning in Modak Catch; item IDs and development-remount cleanup were corrected. A final fresh-session browser error check remains part of the closing verification.
- Prepared run sheet is 1772×886 RGBA, divided into eight 443×443 frames.

## Still needed for production quality

- Full human playthrough and balancing of all six chapters, including every special combination and retry/assist path.
- Final directional Mooshak frames, carrier gait, drummer arms/instruments, vendor/volunteer actions, modular roads/buildings/occluders, water/reflections, and each district's layered production art.
- Rights-cleared recorded dhol, tasha, manjira and musical stems. Current new rhythm voices and accompaniment are procedural synthesis.
- Persistent resume, chapter practice/replay selection, stronger authored/seeded layouts, complete touch/accessibility/device testing, audio calibration testing, and measured performance optimisation.
- Cultural review and final staging/language decisions for the nimarjanam animation.

These remaining items are material. The integrated version is a substantial functional prototype, not a finished production release.
