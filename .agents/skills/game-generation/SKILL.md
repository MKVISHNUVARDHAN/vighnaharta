---
name: game-generation
description: >-
  Use this skill when architecting, writing, or expanding 2D isometric games. It covers isometric mathematics, Y-sorting (depth), and toolchain orchestration.
---

# 2D Isometric Game Generation & Architecture Protocol

When tasked with generating game mechanics or engine code for a 2.5D/isometric game, enforce the following structural patterns to ensure mathematically sound rendering and performant gameplay.

## 1. Toolchain & Engine Assumptions
* **Engine:** Prefer Phaser 3 (for Web/Canvas/WebGL) or lightweight React-wrapped canvas engines for browser compatibility.
* **Architecture:** Maintain strict separation between rendering (Canvas/Phaser) and state management (React/Zustand). Use an `EventBus` to bridge the two.

## 2. Cartesian to Isometric Mathematics
Do not guess isometric positions. Always use strict 2:1 dimetric projection functions to convert standard 2D grid/world coordinates into screen coordinates.

```javascript
// Reference Isometric Math Implementation
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32; // 2:1 ratio

function cartesianToIso(worldX, worldY) {
    return {
        screenX: (worldX - worldY) * (TILE_WIDTH / 2),
        screenY: (worldX + worldY) * (TILE_HEIGHT / 2)
    };
}

function isoToCartesian(screenX, screenY) {
    return {
        worldX: (screenX / (TILE_WIDTH / 2) + screenY / (TILE_HEIGHT / 2)) / 2,
        worldY: (screenY / (TILE_HEIGHT / 2) - screenX / (TILE_WIDTH / 2)) / 2
    };
}
```

## 3. Depth Sorting (Y-Sort) Protocol
In isometric games, objects must overlap correctly based on their position in the 3D world.
1. **Set Origins Correctly:** Ensure all sprites and props have their origin/anchor set to the `bottom-center` (e.g., `setOrigin(0.5, 1)` in Phaser). This represents where the object touches the ground.
2. **Dynamic Depth Updating:** In the engine's `update()` loop, dynamically set the depth (Z-index) of every moving entity based on its vertical position on the screen.
   ```javascript
   // Phaser example:
   entity.setDepth(entity.y);
   ```

## 4. Pipeline for Incorporating AI Generated Assets
When loading AI-generated props and sprites:
1. Load the generated sprite atlas or individual PNGs.
2. Load the corresponding JSON metadata (generated via the `asset-generation` skill) containing the exact bottom-center pixel coordinates.
3. Apply these coordinates directly to the sprite's physics body and rendering origin to ensure flawless Y-sorting against tiles and other dynamic entities.
