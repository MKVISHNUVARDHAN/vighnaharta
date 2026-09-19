import Phaser from 'phaser';

/**
 * CityMap — Procedural Isometric City Generator
 * 
 * Generates a 30×30 tile grid city with:
 * - Main boulevard (procession route)
 * - Side streets and alleys
 * - Building plots (collision)
 * - Open plazas for each minigame
 * - Parks and decorative areas
 * 
 * Uses 2:1 dimetric isometric projection.
 */

const TILE_W = 64;
const TILE_H = 32;
const GRID_SIZE = 30;

// Tile types
export enum TileType {
  EMPTY = 0,
  ROAD = 1,
  SIDEWALK = 2,
  BUILDING = 3,
  PLAZA = 4,
  PARK = 5,
  WATER = 6,
  BRIDGE = 7,
}

// Colors for procedural tile generation
const TILE_COLORS: Record<TileType, number> = {
  [TileType.EMPTY]: 0x1a1a2e,
  [TileType.ROAD]: 0x5a5a6a,
  [TileType.SIDEWALK]: 0x8a8a7a,
  [TileType.BUILDING]: 0x4a3a2a,
  [TileType.PLAZA]: 0x7a6a5a,
  [TileType.PARK]: 0x3a6a3a,
  [TileType.WATER]: 0x2a4a7a,
  [TileType.BRIDGE]: 0x6a5a3a,
};

// Building height colors (walls)
const BUILDING_WALL = 0x3a2a1a;
const BUILDING_ROOF_COLORS = [0xc47a3a, 0xb85a2a, 0xd49a4a, 0xa04a1a, 0xcc6a2a];

// Stage plaza locations (grid coordinates)
export const STAGE_LOCATIONS = [
  { gx: 15, gy: 25, name: 'WELCOME GATE', icon: '✨' },       // Stage 1: Road Rally
  { gx: 8, gy: 20, name: 'MODAK MARKET', icon: '◆' },         // Stage 2: Modak Catch
  { gx: 22, gy: 16, name: 'GARLAND BAZAAR', icon: '✿' },      // Stage 3: Flower Festival
  { gx: 10, gy: 12, name: 'DHOL CHOWK', icon: '♫' },          // Stage 4: Dhol Utsav
  { gx: 20, gy: 7, name: 'MONSOON GHAT', icon: '✦' },         // Stage 5: Monsoon Crossing
  { gx: 15, gy: 3, name: 'RANGOLI COURTYARD', icon: '❈' },    // Stage 6: Rangoli Lightworks
];

// NPC spawn points (grid coords + type)
export const NPC_SPAWNS = [
  { gx: 14, gy: 26, npcId: 'aaji_meera', name: 'Aaji Meera', portrait: '👵🏽' },
  { gx: 7, gy: 21, npcId: 'madhav', name: 'Madhav Halwai', portrait: '👨🏽‍🍳' },
  { gx: 23, gy: 17, npcId: 'sakhi_tara', name: 'Sakhi Tara', portrait: '👩🏽' },
  { gx: 9, gy: 13, npcId: 'rohan', name: 'Rohan Dholi', portrait: '🥁' },
  { gx: 21, gy: 8, npcId: 'kaka_deepak', name: 'Kaka Deepak', portrait: '🧔🏽' },
  { gx: 16, gy: 4, npcId: 'anaya', name: 'Anaya', portrait: '👩🏽‍🎨' },
  // Ambient NPCs
  { gx: 12, gy: 24, npcId: 'devotee_1', name: 'Devotee', portrait: '🙏' },
  { gx: 18, gy: 22, npcId: 'devotee_2', name: 'Child', portrait: '👦🏽' },
  { gx: 5, gy: 15, npcId: 'vendor_1', name: 'Flower Vendor', portrait: '🌸' },
  { gx: 25, gy: 10, npcId: 'devotee_3', name: 'Drummer', portrait: '🪘' },
  { gx: 13, gy: 8, npcId: 'devotee_4', name: 'Grandmother', portrait: '👵🏽' },
  { gx: 20, gy: 14, npcId: 'vendor_2', name: 'Tea Stall Owner', portrait: '☕' },
];

export class CityMap {
  private scene: Phaser.Scene;
  private grid: TileType[][] = [];
  private tileSprites: Phaser.GameObjects.Image[][] = [];
  private buildingSprites: Phaser.GameObjects.Container[] = [];

  // World dimensions in pixels
  public worldWidth = 0;
  public worldHeight = 0;

  // Mooshak spawn point
  public spawnX = 0;
  public spawnY = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Convert grid coords to screen (isometric) coords */
  static toScreen(gx: number, gy: number): { x: number; y: number } {
    return {
      x: (gx - gy) * (TILE_W / 2) + (GRID_SIZE * TILE_W) / 2,
      y: (gx + gy) * (TILE_H / 2) + 100,
    };
  }

  /** Convert screen coords back to grid coords */
  static toGrid(sx: number, sy: number): { gx: number; gy: number } {
    const adjustedX = sx - (GRID_SIZE * TILE_W) / 2;
    const adjustedY = sy - 100;
    return {
      gx: Math.round((adjustedX / (TILE_W / 2) + adjustedY / (TILE_H / 2)) / 2),
      gy: Math.round((adjustedY / (TILE_H / 2) - adjustedX / (TILE_W / 2)) / 2),
    };
  }

  /** Check if a grid position is walkable */
  isWalkable(gx: number, gy: number): boolean {
    if (gx < 0 || gy < 0 || gx >= GRID_SIZE || gy >= GRID_SIZE) return false;
    const tile = this.grid[gy]?.[gx];
    return tile !== undefined
      && tile !== TileType.BUILDING
      && tile !== TileType.EMPTY
      && tile !== TileType.WATER;
  }

  /** Check if a screen position is walkable */
  isScreenPosWalkable(sx: number, sy: number): boolean {
    const { gx, gy } = CityMap.toGrid(sx, sy);
    return this.isWalkable(gx, gy);
  }

  /** Generate the city layout */
  generate() {
    // Initialize grid with empty
    this.grid = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(TileType.EMPTY)
    );

    // === MAIN BOULEVARD (procession route) — serpentine path ===
    this.carveMainBoulevard();

    // === SIDE STREETS ===
    this.carveSideStreets();

    // === PLAZAS at stage locations ===
    for (const stage of STAGE_LOCATIONS) {
      this.carvePlaza(stage.gx, stage.gy, 3);
    }

    // === PARKS ===
    this.carvePark(3, 5, 3, 4);
    this.carvePark(24, 18, 2, 3);
    this.carvePark(6, 10, 2, 2);

    // === FILL remaining EMPTY with BUILDINGS ===
    this.fillBuildings();

    // === ADD SIDEWALKS along roads ===
    this.addSidewalks();

    // === WATER at the northern ghat edge ===
    for (let x = 0; x < GRID_SIZE; x++) {
      if (this.grid[0][x] === TileType.EMPTY) this.grid[0][x] = TileType.WATER;
      if (this.grid[1][x] === TileType.EMPTY) this.grid[1][x] = TileType.WATER;
    }

    // Calculate world size
    const topLeft = CityMap.toScreen(0, 0);
    const bottomRight = CityMap.toScreen(GRID_SIZE - 1, GRID_SIZE - 1);
    const topRight = CityMap.toScreen(GRID_SIZE - 1, 0);
    const bottomLeft = CityMap.toScreen(0, GRID_SIZE - 1);
    this.worldWidth = (topRight.x - bottomLeft.x) + TILE_W * 2;
    this.worldHeight = (bottomRight.y - topLeft.y) + TILE_H * 4 + 200;

    // Spawn point (southern entrance plaza, plenty of roaming space)
    const spawn = CityMap.toScreen(15, 28);
    this.spawnX = spawn.x;
    this.spawnY = spawn.y;
  }

  /** Carve the main boulevard — wide serpentine procession path */
  private carveMainBoulevard() {
    // Generous entrance plaza for free roaming on start
    this.carvePlaza(15, 28, 2);

    // Path from south to north, serpentining through the city
    const waypoints = [
      { x: 15, y: 28 }, { x: 15, y: 25 }, // Start → Welcome Gate
      { x: 12, y: 23 }, { x: 8, y: 20 },  // → Modak Market
      { x: 10, y: 18 }, { x: 15, y: 16 }, { x: 22, y: 16 }, // → Garland Bazaar
      { x: 18, y: 14 }, { x: 10, y: 12 }, // → Dhol Chowk
      { x: 12, y: 10 }, { x: 18, y: 8 }, { x: 20, y: 7 }, // → Monsoon Ghat
      { x: 18, y: 5 }, { x: 15, y: 3 },   // → Rangoli Courtyard
    ];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];
      this.carveLine(from.x, from.y, to.x, to.y, TileType.ROAD, 2);
    }
  }

  /** Carve side streets branching off the main road */
  private carveSideStreets() {
    // Horizontal and vertical side streets
    const streets = [
      // Horizontal cross streets
      { x1: 3, y1: 25, x2: 27, y2: 25 },
      { x1: 5, y1: 20, x2: 25, y2: 20 },
      { x1: 4, y1: 16, x2: 26, y2: 16 },
      { x1: 6, y1: 12, x2: 24, y2: 12 },
      { x1: 8, y1: 7, x2: 22, y2: 7 },
      // Vertical avenues
      { x1: 8, y1: 4, x2: 8, y2: 27 },
      { x1: 15, y1: 2, x2: 15, y2: 28 },
      { x1: 22, y1: 4, x2: 22, y2: 27 },
    ];

    for (const s of streets) {
      this.carveLine(s.x1, s.y1, s.x2, s.y2, TileType.ROAD, 1);
    }
  }

  /** Carve a line of tiles between two points */
  private carveLine(x1: number, y1: number, x2: number, y2: number, type: TileType, width: number) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps;
      const cx = Math.round(x1 + (x2 - x1) * t);
      const cy = Math.round(y1 + (y2 - y1) * t);

      for (let dx = -width + 1; dx < width; dx++) {
        for (let dy = -width + 1; dy < width; dy++) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && ny >= 0 && nx < GRID_SIZE && ny < GRID_SIZE) {
            this.grid[ny][nx] = type;
          }
        }
      }
    }
  }

  /** Carve a plaza (open area) */
  private carvePlaza(cx: number, cy: number, radius: number) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && ny >= 0 && nx < GRID_SIZE && ny < GRID_SIZE) {
          this.grid[ny][nx] = TileType.PLAZA;
        }
      }
    }
  }

  /** Carve a park area */
  private carvePark(cx: number, cy: number, w: number, h: number) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && ny >= 0 && nx < GRID_SIZE && ny < GRID_SIZE) {
          if (this.grid[ny][nx] === TileType.EMPTY) {
            this.grid[ny][nx] = TileType.PARK;
          }
        }
      }
    }
  }

  /** Fill remaining empty cells with buildings */
  private fillBuildings() {
    for (let y = 2; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (this.grid[y][x] === TileType.EMPTY) {
          this.grid[y][x] = TileType.BUILDING;
        }
      }
    }
  }

  /** Add sidewalks adjacent to roads */
  private addSidewalks() {
    const copy = this.grid.map(row => [...row]);
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (copy[y][x] === TileType.BUILDING) {
          // Check if adjacent to road or plaza
          const neighbors = [
            [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
          ];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && ny >= 0 && nx < GRID_SIZE && ny < GRID_SIZE) {
              if (copy[ny][nx] === TileType.ROAD || copy[ny][nx] === TileType.PLAZA) {
                this.grid[y][x] = TileType.SIDEWALK;
                break;
              }
            }
          }
        }
      }
    }
  }

  /** Generate procedural tile textures */
  generateTextures() {
    // Ground tiles (diamond shaped for isometric)
    for (const [typeStr, color] of Object.entries(TILE_COLORS)) {
      const type = Number(typeStr) as TileType;
      const key = `tile_${type}`;
      if (this.scene.textures.exists(key)) continue;

      const g = this.scene.add.graphics();

      // Draw isometric diamond
      g.fillStyle(color, 1);
      g.beginPath();
      g.moveTo(TILE_W / 2, 0);           // top
      g.lineTo(TILE_W, TILE_H / 2);       // right
      g.lineTo(TILE_W / 2, TILE_H);       // bottom
      g.lineTo(0, TILE_H / 2);            // left
      g.closePath();
      g.fill();

      // Add subtle grid lines
      g.lineStyle(1, 0xffffff, 0.08);
      g.beginPath();
      g.moveTo(TILE_W / 2, 0);
      g.lineTo(TILE_W, TILE_H / 2);
      g.lineTo(TILE_W / 2, TILE_H);
      g.lineTo(0, TILE_H / 2);
      g.closePath();
      g.strokePath();

      // Road markings
      if (type === TileType.ROAD) {
        g.fillStyle(0xaaaaaa, 0.3);
        g.fillRect(TILE_W / 2 - 2, TILE_H / 2 - 1, 4, 2);
      }

      // Park grass texture dots
      if (type === TileType.PARK) {
        g.fillStyle(0x5a9a5a, 0.5);
        for (let i = 0; i < 6; i++) {
          const px = 15 + Math.random() * (TILE_W - 30);
          const py = 8 + Math.random() * (TILE_H - 16);
          g.fillCircle(px, py, 1.5);
        }
      }

      // Water animation shimmer
      if (type === TileType.WATER) {
        g.fillStyle(0x4a7aba, 0.4);
        g.fillRect(10, TILE_H / 2 - 1, TILE_W - 20, 2);
      }

      // Plaza cobblestone pattern
      if (type === TileType.PLAZA) {
        g.fillStyle(0x9a8a6a, 0.3);
        for (let i = 0; i < 4; i++) {
          const px = 10 + i * 12;
          g.fillRect(px, TILE_H / 2 - 2, 6, 4);
        }
      }

      g.generateTexture(key, TILE_W, TILE_H);
      g.destroy();
    }

    // Building textures (taller, with walls)
    for (let i = 0; i < 5; i++) {
      const key = `building_gen_${i}`;
      if (this.scene.textures.exists(key)) continue;

      const g = this.scene.add.graphics();
      const height = 30 + i * 12;
      const roofColor = BUILDING_ROOF_COLORS[i];

      // Left wall
      g.fillStyle(BUILDING_WALL, 1);
      g.beginPath();
      g.moveTo(0, TILE_H / 2);
      g.lineTo(TILE_W / 2, TILE_H);
      g.lineTo(TILE_W / 2, TILE_H - height);
      g.lineTo(0, TILE_H / 2 - height);
      g.closePath();
      g.fill();

      // Right wall
      g.fillStyle(BUILDING_WALL + 0x111111, 1);
      g.beginPath();
      g.moveTo(TILE_W, TILE_H / 2);
      g.lineTo(TILE_W / 2, TILE_H);
      g.lineTo(TILE_W / 2, TILE_H - height);
      g.lineTo(TILE_W, TILE_H / 2 - height);
      g.closePath();
      g.fill();

      // Roof (top face)
      g.fillStyle(roofColor, 1);
      g.beginPath();
      g.moveTo(TILE_W / 2, -height);
      g.lineTo(TILE_W, TILE_H / 2 - height);
      g.lineTo(TILE_W / 2, TILE_H - height);
      g.lineTo(0, TILE_H / 2 - height);
      g.closePath();
      g.fill();

      // Windows
      g.fillStyle(0xffdd88, 0.6);
      const windowY = TILE_H - height + 8;
      g.fillRect(TILE_W / 2 - 8, windowY, 5, 5);
      g.fillRect(TILE_W / 2 + 3, windowY, 5, 5);
      if (height > 40) {
        g.fillRect(TILE_W / 2 - 8, windowY + 12, 5, 5);
        g.fillRect(TILE_W / 2 + 3, windowY + 12, 5, 5);
      }

      g.generateTexture(key, TILE_W, TILE_H + height);
      g.destroy();
    }
  }

  /** Render all tiles to the scene with real models and festival assets */
  render() {
    this.generateTextures();

    // 1. Render ground tiles (sorted by row for proper isometric depth)
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const type = this.grid[y][x];
        if (type === TileType.BUILDING) continue;

        const { x: sx, y: sy } = CityMap.toScreen(x, y);

        // Prefer Kenney high-res isometric tiles
        let key = `tile_${type}`;
        let scale = 1;
        if (type === TileType.ROAD && this.scene.textures.exists('k_road')) {
          key = 'k_road';
          scale = 0.5;
        } else if (type === TileType.PLAZA && this.scene.textures.exists('k_plaza')) {
          key = 'k_plaza';
          scale = 0.5;
        } else if (type === TileType.PARK && this.scene.textures.exists('k_grass')) {
          key = 'k_grass';
          scale = 0.5;
        } else if (type === TileType.WATER && this.scene.textures.exists('k_water')) {
          key = 'k_water';
          scale = 0.5;
        }

        if (this.scene.textures.exists(key)) {
          this.scene.add.image(sx, sy, key)
            .setScale(scale)
            .setOrigin(0.5, 0.5)
            .setDepth(sy - 100);
        }

        // Park trees with nature kit models and scenery trees
        if (type === TileType.PARK && (x + y) % 2 === 0) {
          const treeKey = (x + y) % 4 === 0 && this.scene.textures.exists('nature_tree_1')
            ? 'nature_tree_1'
            : (x + y) % 4 === 2 && this.scene.textures.exists('nature_tree_dark')
            ? 'nature_tree_dark'
            : this.scene.textures.exists('tree')
            ? 'tree'
            : 'bush';
          const tScale = treeKey.startsWith('nature') ? 0.38 : treeKey === 'tree' ? 0.11 : 0.08;
          this.scene.add.image(sx, sy, treeKey)
            .setScale(tScale)
            .setOrigin(0.5, 0.92)
            .setDepth(sy + 4);
        }
      }
    }

    // 2. Render sacred rangoli mandalas at stage plazas & south entrance
    if (this.scene.textures.exists('rangoli_road')) {
      for (const loc of STAGE_LOCATIONS) {
        const { x: sx, y: sy } = CityMap.toScreen(loc.gx, loc.gy);
        this.scene.add.image(sx, sy, 'rangoli_road')
          .setScale(0.14)
          .setOrigin(0.5, 0.5)
          .setDepth(sy - 98)
          .setAlpha(0.85);
      }
      // Entrance plaza rangoli
      const entrance = CityMap.toScreen(15, 28);
      this.scene.add.image(entrance.x, entrance.y, 'rangoli_road')
        .setScale(0.14)
        .setOrigin(0.5, 0.5)
        .setDepth(entrance.y - 98)
        .setAlpha(0.85);
    }

    // 3. Render buildings with full variety — commercial, suburban, isometric, temples
    //    Zone logic: boulevard-adjacent = tall commercial, side streets = suburban, landmarks = temples
    const COMM_KEYS = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n'];
    const COMM_SKY_KEYS = ['a','b','c','d','e'];
    const SUBURB_KEYS = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u'];

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (this.grid[y][x] !== TileType.BUILDING) continue;

        const { x: sx, y: sy } = CityMap.toScreen(x, y);
        const seed = (x * 7 + y * 13 + x * y) % 100;

        // Determine zone: near main boulevard (x≈8,15,22) = commercial, else suburban
        const nearBoulevard = Math.min(Math.abs(x - 8), Math.abs(x - 15), Math.abs(x - 22)) <= 2;
        // Near stage locations = landmark zone
        const nearStage = STAGE_LOCATIONS.some(s => Math.abs(x - s.gx) <= 1 && Math.abs(y - s.gy) <= 1);

        let placed = false;

        // === LANDMARK ZONE: Temples & Heritage ===
        if (nearStage && seed % 3 === 0 && this.scene.textures.exists('building_temple')) {
          this.scene.add.image(sx, sy, 'building_temple')
            .setScale(0.14)
            .setOrigin(0.5, 0.94)
            .setDepth(sy + 10);
          placed = true;
        } else if (nearStage && seed % 3 === 1 && this.scene.textures.exists('building_house')) {
          this.scene.add.image(sx, sy, 'building_house')
            .setScale(0.11)
            .setOrigin(0.5, 0.92)
            .setDepth(sy + 10);
          placed = true;
        }

        // === BOULEVARD ZONE: Tall commercial buildings & skyscrapers ===
        if (!placed && nearBoulevard) {
          // Skyscrapers on main intersections (sparse)
          if (seed < 8) {
            const skyKey = `comm_sky_${COMM_SKY_KEYS[seed % COMM_SKY_KEYS.length]}`;
            if (this.scene.textures.exists(skyKey)) {
              this.scene.add.image(sx, sy, skyKey)
                .setScale(0.32)
                .setOrigin(0.5, 0.92)
                .setDepth(sy + 12);
              placed = true;
            }
          }
          // Regular commercial buildings
          if (!placed) {
            const commKey = `comm_bldg_${COMM_KEYS[seed % COMM_KEYS.length]}`;
            if (this.scene.textures.exists(commKey)) {
              this.scene.add.image(sx, sy, commKey)
                .setScale(0.34)
                .setOrigin(0.5, 0.9)
                .setDepth(sy + 10);
              placed = true;
            }
          }
        }

        // === SIDE STREETS: Suburban houses ===
        if (!placed) {
          // Pick from the full range of suburban buildings
          const subKey = `suburb_bldg_${SUBURB_KEYS[seed % SUBURB_KEYS.length]}`;
          if (this.scene.textures.exists(subKey)) {
            this.scene.add.image(sx, sy, subKey)
              .setScale(0.36)
              .setOrigin(0.5, 0.9)
              .setDepth(sy + 10);
            placed = true;
          }
        }

        // === FESTIVAL PAVILIONS (sparse, at plazas) ===
        if (!placed && seed % 7 === 0) {
          const festKey = seed % 2 === 0 ? 'building_A' : (seed % 3 === 0 ? 'building_B' : 'building_C');
          if (this.scene.textures.exists(festKey)) {
            this.scene.add.image(sx, sy, festKey)
              .setScale(0.13)
              .setOrigin(0.5, 0.9)
              .setDepth(sy + 10);
            placed = true;
          }
        }

        // === KENNEY ISOMETRIC TILES (fallback with full 8-tile variety) ===
        if (!placed) {
          const kbldgKey = `k_bldg_${seed % 8}`;
          if (this.scene.textures.exists(kbldgKey)) {
            this.scene.add.image(sx, sy, kbldgKey)
              .setScale(0.48)
              .setOrigin(0.5, 0.88)
              .setDepth(sy + 10);
            placed = true;
          }
        }

        // === PROCEDURAL FALLBACK ===
        if (!placed) {
          const fallbackKey = `building_gen_${seed % 5}`;
          if (this.scene.textures.exists(fallbackKey)) {
            this.scene.add.image(sx, sy, fallbackKey)
              .setOrigin(0.5, 1)
              .setDepth(sy + 10);
          }
        }

        // === BUILDING DECORATIONS: Awnings, parasols on some buildings ===
        if (placed && seed % 5 === 0) {
          const decoKey = seed % 3 === 0 ? 'comm_awning' : (seed % 3 === 1 ? 'comm_parasol_a' : 'comm_parasol_b');
          if (this.scene.textures.exists(decoKey)) {
            this.scene.add.image(sx, sy + 8, decoKey)
              .setScale(0.25)
              .setOrigin(0.5, 0.9)
              .setDepth(sy + 11);
          }
        }
      }
    }

    // 4. Render festival devotees, dancers, flag-bearers, benches, crates, and street props along the boulevard
    for (let y = 2; y < GRID_SIZE - 2; y++) {
      for (let x = 2; x < GRID_SIZE - 2; x++) {
        const type = this.grid[y][x];
        if (type !== TileType.SIDEWALK && type !== TileType.PLAZA) continue;

        // Check if adjacent to road
        const isRoadside = (
          this.grid[y - 1]?.[x] === TileType.ROAD ||
          this.grid[y + 1]?.[x] === TileType.ROAD ||
          this.grid[y]?.[x - 1] === TileType.ROAD ||
          this.grid[y]?.[x + 1] === TileType.ROAD
        );

        if (isRoadside) {
          const { x: sx, y: sy } = CityMap.toScreen(x, y);
          const propSeed = (x * 11 + y * 17) % 14;

          if (propSeed === 1 && this.scene.textures.exists('devotee_dancer')) {
            const dancer = this.scene.add.image(sx, sy, 'devotee_dancer')
              .setScale(0.065)
              .setOrigin(0.5, 0.95)
              .setDepth(sy + 2);
            this.scene.tweens.add({
              targets: dancer,
              angle: { from: -4, to: 4 },
              duration: 650 + (x % 3) * 100,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          } else if (propSeed === 2 && this.scene.textures.exists('bench')) {
            // 3D Festival Bench
            this.scene.add.image(sx, sy, 'bench')
              .setScale(0.09)
              .setOrigin(0.5, 0.9)
              .setDepth(sy + 1);
          } else if (propSeed === 3 && this.scene.textures.exists('devotee_flag')) {
            const flagBearer = this.scene.add.image(sx, sy, 'devotee_flag')
              .setScale(0.065)
              .setOrigin(0.5, 0.95)
              .setDepth(sy + 2);
            this.scene.tweens.add({
              targets: flagBearer,
              scaleY: { from: 0.065, to: 0.068 },
              duration: 800,
              yoyo: true,
              repeat: -1
            });
          } else if (propSeed === 4 && this.scene.textures.exists('bush')) {
            // 3D Decorative Bush / Planter
            this.scene.add.image(sx, sy, 'bush')
              .setScale(0.08)
              .setOrigin(0.5, 0.9)
              .setDepth(sy + 1);
          } else if (propSeed === 5 && this.scene.textures.exists('devotee')) {
            this.scene.add.image(sx, sy, 'devotee')
              .setScale(0.065)
              .setOrigin(0.5, 0.95)
              .setDepth(sy + 2);
          } else if (propSeed === 6 && this.scene.textures.exists('box')) {
            // 3D Market Offering Box / Crate
            this.scene.add.image(sx, sy, 'box')
              .setScale(0.08)
              .setOrigin(0.5, 0.9)
              .setDepth(sy + 1);
          } else if (propSeed === 7 && this.scene.textures.exists('barricade')) {
            this.scene.add.image(sx, sy, 'barricade')
              .setScale(0.055)
              .setOrigin(0.5, 0.9)
              .setDepth(sy + 1);
          }
        }
      }
    }

    // 5. River bridges where roads reach northern water ghat
    for (let x = 0; x < GRID_SIZE; x++) {
      if (this.grid[1][x] === TileType.ROAD || this.grid[2][x] === TileType.ROAD) {
        const { x: sx, y: sy } = CityMap.toScreen(x, 1);
        const bridgeKey = x % 2 === 0 && this.scene.textures.exists('nature_bridge_stone')
          ? 'nature_bridge_stone'
          : this.scene.textures.exists('nature_bridge_wood')
          ? 'nature_bridge_wood'
          : null;
        if (bridgeKey) {
          this.scene.add.image(sx, sy, bridgeKey)
            .setScale(0.42)
            .setOrigin(0.5, 0.75)
            .setDepth(sy - 90);
        }
      }
    }

    // 6. Real 3D Streetlights with warm golden illumination halos
    for (let y = 0; y < GRID_SIZE; y += 3) {
      for (let x = 0; x < GRID_SIZE; x += 3) {
        if (this.grid[y][x] === TileType.ROAD) {
          const { x: sx, y: sy } = CityMap.toScreen(x, y);

          if (this.scene.textures.exists('streetlight')) {
            this.scene.add.image(sx + 15, sy, 'streetlight')
              .setScale(0.11)
              .setOrigin(0.5, 0.95)
              .setDepth(sy + 5);
          } else {
            const lamp = this.scene.add.graphics().setDepth(sy + 5);
            lamp.lineStyle(2, 0x888888, 0.8);
            lamp.lineBetween(sx + 15, sy, sx + 15, sy - 25);
          }

          const glow = this.scene.add.circle(sx + 15, sy - 34, 12, 0xffd700, 0.4)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(sy + 6);
          this.scene.tweens.add({
            targets: glow,
            alpha: 0.2,
            scale: 1.4,
            duration: 1200 + Math.random() * 600,
            yoyo: true,
            repeat: -1,
          });
        }
      }
    }
  }

  /** Get the grid data (for collision checks) */
  getGrid(): TileType[][] {
    return this.grid;
  }

  /** Get tile type at grid position */
  getTileAt(gx: number, gy: number): TileType {
    if (gx < 0 || gy < 0 || gx >= GRID_SIZE || gy >= GRID_SIZE) return TileType.EMPTY;
    return this.grid[gy][gx];
  }
}
