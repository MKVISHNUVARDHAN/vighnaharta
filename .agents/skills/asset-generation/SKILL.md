---
name: asset-generation
description: >-
  Use this skill when the user asks to generate 2D isometric game assets, sprites, props, or tiles using AI image tools. It contains protocols for strict perspective prompting, background removal, and asset consistency.
---

# 2D Isometric Asset Generation Protocol

When generating visual assets for isometric games, follow this precise pipeline to ensure engine-ready sprites.

## 1. Establish the "Art Bible"
Before generating, define a core style string (e.g., `stylized low-poly 3D render, vibrant pastel colors, soft ambient occlusion`). Append this exact string to **every** asset prompt to guarantee visual cohesion across the game.

## 2. Core Prompting Rules
Always enforce isometric perspective and clean extraction by including these keywords:
* **Mandatory Perspective:** `isometric perspective, 2.5D, orthographic, top-down isometric view`
* **Extraction Helpers:** `bright plain white background, isolated, clean silhouette`
* **Lighting Consistency:** ALWAYS dictate the light source (e.g., `studio lighting, light from top-left, soft shadows`).
* **Negative Prompts (if applicable):** `--no perspective, vanishing points, foreshortening, cast shadow, ground shadow, drop shadow` (Removing ground shadows makes engine-side depth sorting much easier).

## 3. Specific Asset Formulas

### A. Environment & Terrain Tiles
* **Goal:** A perfect diamond/block slice of land.
* **Prompt:** `isometric [terrain type: grassy plain, cobblestone] tile, perfect square block, floating island style, [ART BIBLE STYLE], top-down isometric view, bright plain white background, isolated`

### B. Props & Buildings
* **Goal:** Consistent scale and strictly orthographic angles.
* **Prompt:** `isometric [prop type: wooden barrel, blacksmith forge], game asset, [ART BIBLE STYLE], facing bottom-left, light from top-left, white background, high contrast edges`

### C. Character Sprites
* **Goal:** 8-way directional consistency.
* **Prompt:** `isometric character sprite, [Character description], [Pose], [ART BIBLE STYLE], white background, full body, clear edges, character design sheet`
* *Note:* For precise 8-way angles, recommend using ControlNet with an OpenPose isometric skeleton reference.

## 4. Post-Processing Instructions (Agent Actions)
After generating the image:
1. **Background Removal:** Use Python tools like `rembg` or Pillow to strip the white/green backgrounds automatically.
2. **Cropping & Bounding Boxes:** Auto-crop the image to the bounding box of the visible pixels. Mask terrain tiles mathematically using a 2:1 ratio (approx. 26.565 degrees) to ensure perfect grid tiling.
3. **Pivot Points:** Calculate the "pivot point" or anchor (usually `bottom-center` of the visible pixels) and write this metadata into a JSON file so the game engine applies depth-sorting correctly.
