import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(0, 0, width, height, 0x0a0a1a).setOrigin(0);

    // Title
    this.add.text(width / 2, height / 2 - 70, 'VIGHNAHARTA', {
      fontSize: '56px',
      color: '#ffd700',
      fontStyle: 'bold',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 20, 'गणपति बाप्पा मोरया', {
      fontSize: '22px',
      color: '#ff9944',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Progress Bar
    const barWidth = 420;
    const barHeight = 16;
    this.add.rectangle(width / 2, height / 2 + 50, barWidth + 6, barHeight + 6, 0x222222)
      .setStrokeStyle(2, 0x444444);
    const barFill = this.add.rectangle(
      width / 2 - barWidth / 2, height / 2 + 50, 0, barHeight, 0xffd700
    ).setOrigin(0, 0.5);

    const loadText = this.add.text(width / 2, height / 2 + 85, 'Loading...', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      barFill.width = value * barWidth;
      loadText.setText(`Loading... ${Math.floor(value * 100)}%`);
      this.game.events.emit('preload-progress', value);
    });

    this.load.on('complete', () => {
      this.game.events.emit('preload-complete');
    });

    // === ORIGINAL ASSETS ===
    this.load.image('ganesha', 'assets/ganesha.png');
    this.load.image('road_tile', 'assets/road_tile.png');
    this.load.image('barricade', 'assets/barricade.png');
    this.load.image('building', 'assets/building.png');
    this.load.image('building_house', 'assets/building_house.png');
    this.load.image('building_temple', 'assets/building_temple.png');
    this.load.image('devotee', 'assets/devotee.png');
    this.load.image('devotee_flag', 'assets/devotee_flag.png');
    this.load.image('devotee_dancer', 'assets/devotee_dancer.png');
    this.load.image('tree', 'assets/scenery_tree.png');
    this.load.image('rangoli_road', 'assets/road_rangoli.png');
    this.load.image('mooshak-scout', 'assets/mooshak-scout.png');

    // Mooshak run spritesheet
    this.load.spritesheet('mooshak-run-v1', 'assets/v2/mooshak/mooshak-run-sheet-v1.png', {
      frameWidth: 443,
      frameHeight: 443,
    });

    // === KAYKIT / KENNEY FESTIVAL ASSETS ===
    this.load.image('building_A', 'assets/festival/building_A.png');
    this.load.image('building_B', 'assets/festival/building_B.png');
    this.load.image('building_C', 'assets/festival/building_C.png');
    this.load.image('bench', 'assets/festival/bench.png');
    this.load.image('bush', 'assets/festival/bush.png');
    this.load.image('streetlight', 'assets/festival/streetlight.png');
    this.load.image('box', 'assets/festival/box_A.png');
    this.load.image('barricade', 'assets/barricade.png');

    // === KENNEY ISOMETRIC 3D BUILDINGS ===
    this.load.image('k_bldg_0', 'assets/kenney/isometric-buildings/PNG/buildingTiles_001.png');
    this.load.image('k_bldg_1', 'assets/kenney/isometric-buildings/PNG/buildingTiles_002.png');
    this.load.image('k_bldg_2', 'assets/kenney/isometric-buildings/PNG/buildingTiles_009.png');
    this.load.image('k_bldg_3', 'assets/kenney/isometric-buildings/PNG/buildingTiles_010.png');
    this.load.image('k_bldg_4', 'assets/kenney/isometric-buildings/PNG/buildingTiles_018.png');
    this.load.image('k_bldg_5', 'assets/kenney/isometric-buildings/PNG/buildingTiles_027.png');
    this.load.image('k_bldg_6', 'assets/kenney/isometric-buildings/PNG/buildingTiles_034.png');
    this.load.image('k_bldg_7', 'assets/kenney/isometric-buildings/PNG/buildingTiles_041.png');

    // === KENNEY ISOMETRIC TILES ===
    this.load.image('k_road', 'assets/kenney/isometric-city/PNG/cityTiles_071.png');
    this.load.image('k_plaza', 'assets/kenney/isometric-city/PNG/cityTiles_065.png');
    this.load.image('k_grass', 'assets/kenney/isometric-city/PNG/cityTiles_056.png');
    this.load.image('k_water', 'assets/kenney/isometric-city/PNG/cityTiles_066.png');

    // === VFX TEXTURES ===
    this.load.image('spark_01', 'assets/festival/spark_01.png');
    this.load.image('star_01', 'assets/festival/star_01.png');
    this.load.image('particle_flare', 'assets/kenney/particle-pack/PNG (Transparent)/flare_01.png');
    this.load.image('particle_fire', 'assets/kenney/particle-pack/PNG (Transparent)/fire_01.png');
    this.load.image('particle_smoke', 'assets/kenney/particle-pack/PNG (Transparent)/smoke_01.png');
    this.load.image('particle_circle', 'assets/kenney/particle-pack/PNG (Transparent)/circle_05.png');
    this.load.image('smoke_puff_0', 'assets/kenney/smoke/PNG/White puff/whitePuff00.png');
    this.load.image('smoke_puff_1', 'assets/kenney/smoke/PNG/White puff/whitePuff01.png');
    this.load.image('smoke_puff_2', 'assets/kenney/smoke/PNG/White puff/whitePuff02.png');
    this.load.image('smoke_puff_3', 'assets/kenney/smoke/PNG/White puff/whitePuff03.png');

    // === NATURE KIT ASSETS ===
    this.load.image('nature_tree_1', 'assets/kenney/nature/Isometric/tree_blocks_NE.png');
    this.load.image('nature_tree_dark', 'assets/kenney/nature/Isometric/tree_blocks_dark_NE.png');
    this.load.image('nature_tree_fall', 'assets/kenney/nature/Isometric/tree_blocks_fall_NE.png');
    this.load.image('nature_bridge_stone', 'assets/kenney/nature/Isometric/bridge_center_stone_NE.png');
    this.load.image('nature_bridge_wood', 'assets/kenney/nature/Isometric/bridge_center_wood_NE.png');

    // === COMMERCIAL & SUBURBAN PREVIEWS ===
    this.load.image('comm_bldg_a', 'assets/kenney/commercial/Previews/building-a.png');
    this.load.image('comm_bldg_b', 'assets/kenney/commercial/Previews/building-b.png');
    this.load.image('comm_bldg_c', 'assets/kenney/commercial/Previews/building-c.png');
    this.load.image('comm_bldg_d', 'assets/kenney/commercial/Previews/building-d.png');
    this.load.image('comm_bldg_e', 'assets/kenney/commercial/Previews/building-e.png');
    this.load.image('suburb_bldg_a', 'assets/kenney/suburban/Previews/building-type-a.png');
    this.load.image('suburb_bldg_b', 'assets/kenney/suburban/Previews/building-type-b.png');
    this.load.image('suburb_bldg_c', 'assets/kenney/suburban/Previews/building-type-c.png');
    this.load.image('suburb_bldg_d', 'assets/kenney/suburban/Previews/building-type-d.png');
    this.load.image('suburb_bldg_e', 'assets/kenney/suburban/Previews/building-type-e.png');

    // === MORE COMMERCIAL PREVIEWS ===
    this.load.image('comm_bldg_f', 'assets/kenney/commercial/Previews/building-f.png');
    this.load.image('comm_bldg_g', 'assets/kenney/commercial/Previews/building-g.png');
    this.load.image('comm_bldg_h', 'assets/kenney/commercial/Previews/building-h.png');
    this.load.image('comm_bldg_i', 'assets/kenney/commercial/Previews/building-i.png');
    this.load.image('comm_bldg_j', 'assets/kenney/commercial/Previews/building-j.png');
    this.load.image('comm_bldg_k', 'assets/kenney/commercial/Previews/building-k.png');
    this.load.image('comm_bldg_l', 'assets/kenney/commercial/Previews/building-l.png');
    this.load.image('comm_bldg_m', 'assets/kenney/commercial/Previews/building-m.png');
    this.load.image('comm_bldg_n', 'assets/kenney/commercial/Previews/building-n.png');
    
    this.load.image('comm_sky_a', 'assets/kenney/commercial/Previews/building-skyscraper-a.png');
    this.load.image('comm_sky_b', 'assets/kenney/commercial/Previews/building-skyscraper-b.png');
    this.load.image('comm_sky_c', 'assets/kenney/commercial/Previews/building-skyscraper-c.png');
    this.load.image('comm_sky_d', 'assets/kenney/commercial/Previews/building-skyscraper-d.png');
    this.load.image('comm_sky_e', 'assets/kenney/commercial/Previews/building-skyscraper-e.png');
    
    this.load.image('comm_low_a', 'assets/kenney/commercial/Previews/low-detail-building-a.png');
    this.load.image('comm_low_b', 'assets/kenney/commercial/Previews/low-detail-building-b.png');
    this.load.image('comm_low_c', 'assets/kenney/commercial/Previews/low-detail-building-c.png');
    this.load.image('comm_low_d', 'assets/kenney/commercial/Previews/low-detail-building-d.png');
    this.load.image('comm_low_e', 'assets/kenney/commercial/Previews/low-detail-building-e.png');
    this.load.image('comm_low_f', 'assets/kenney/commercial/Previews/low-detail-building-f.png');
    this.load.image('comm_low_g', 'assets/kenney/commercial/Previews/low-detail-building-g.png');
    this.load.image('comm_low_h', 'assets/kenney/commercial/Previews/low-detail-building-h.png');
    this.load.image('comm_low_i', 'assets/kenney/commercial/Previews/low-detail-building-i.png');
    this.load.image('comm_low_j', 'assets/kenney/commercial/Previews/low-detail-building-j.png');
    this.load.image('comm_low_k', 'assets/kenney/commercial/Previews/low-detail-building-k.png');
    this.load.image('comm_low_l', 'assets/kenney/commercial/Previews/low-detail-building-l.png');
    this.load.image('comm_low_m', 'assets/kenney/commercial/Previews/low-detail-building-m.png');
    this.load.image('comm_low_n', 'assets/kenney/commercial/Previews/low-detail-building-n.png');
    
    this.load.image('comm_low_wide_a', 'assets/kenney/commercial/Previews/low-detail-building-wide-a.png');
    this.load.image('comm_low_wide_b', 'assets/kenney/commercial/Previews/low-detail-building-wide-b.png');
    
    this.load.image('comm_awning', 'assets/kenney/commercial/Previews/detail-awning.png');
    this.load.image('comm_awning_wide', 'assets/kenney/commercial/Previews/detail-awning-wide.png');
    this.load.image('comm_overhang', 'assets/kenney/commercial/Previews/detail-overhang.png');
    this.load.image('comm_overhang_wide', 'assets/kenney/commercial/Previews/detail-overhang-wide.png');
    this.load.image('comm_parasol_a', 'assets/kenney/commercial/Previews/detail-parasol-a.png');
    this.load.image('comm_parasol_b', 'assets/kenney/commercial/Previews/detail-parasol-b.png');

    // === MORE SUBURBAN PREVIEWS ===
    this.load.image('suburb_bldg_f', 'assets/kenney/suburban/Previews/building-type-f.png');
    this.load.image('suburb_bldg_g', 'assets/kenney/suburban/Previews/building-type-g.png');
    this.load.image('suburb_bldg_h', 'assets/kenney/suburban/Previews/building-type-h.png');
    this.load.image('suburb_bldg_i', 'assets/kenney/suburban/Previews/building-type-i.png');
    this.load.image('suburb_bldg_j', 'assets/kenney/suburban/Previews/building-type-j.png');
    this.load.image('suburb_bldg_k', 'assets/kenney/suburban/Previews/building-type-k.png');
    this.load.image('suburb_bldg_l', 'assets/kenney/suburban/Previews/building-type-l.png');
    this.load.image('suburb_bldg_m', 'assets/kenney/suburban/Previews/building-type-m.png');
    this.load.image('suburb_bldg_n', 'assets/kenney/suburban/Previews/building-type-n.png');
    this.load.image('suburb_bldg_o', 'assets/kenney/suburban/Previews/building-type-o.png');
    this.load.image('suburb_bldg_p', 'assets/kenney/suburban/Previews/building-type-p.png');
    this.load.image('suburb_bldg_q', 'assets/kenney/suburban/Previews/building-type-q.png');
    this.load.image('suburb_bldg_r', 'assets/kenney/suburban/Previews/building-type-r.png');
    this.load.image('suburb_bldg_s', 'assets/kenney/suburban/Previews/building-type-s.png');
    this.load.image('suburb_bldg_t', 'assets/kenney/suburban/Previews/building-type-t.png');
    this.load.image('suburb_bldg_u', 'assets/kenney/suburban/Previews/building-type-u.png');

    this.load.image('suburb_fence', 'assets/kenney/suburban/Previews/fence.png');
    this.load.image('suburb_fence_low', 'assets/kenney/suburban/Previews/fence-low.png');
    this.load.image('suburb_fence_1x2', 'assets/kenney/suburban/Previews/fence-1x2.png');
    this.load.image('suburb_fence_1x3', 'assets/kenney/suburban/Previews/fence-1x3.png');
    this.load.image('suburb_fence_1x4', 'assets/kenney/suburban/Previews/fence-1x4.png');
    this.load.image('suburb_fence_2x2', 'assets/kenney/suburban/Previews/fence-2x2.png');
    this.load.image('suburb_fence_2x3', 'assets/kenney/suburban/Previews/fence-2x3.png');
    this.load.image('suburb_fence_3x2', 'assets/kenney/suburban/Previews/fence-3x2.png');
    this.load.image('suburb_fence_3x3', 'assets/kenney/suburban/Previews/fence-3x3.png');
    
    this.load.image('suburb_driveway_long', 'assets/kenney/suburban/Previews/driveway-long.png');
    this.load.image('suburb_driveway_short', 'assets/kenney/suburban/Previews/driveway-short.png');
    
    this.load.image('suburb_path_long', 'assets/kenney/suburban/Previews/path-long.png');
    this.load.image('suburb_path_short', 'assets/kenney/suburban/Previews/path-short.png');
    this.load.image('suburb_path_stones_long', 'assets/kenney/suburban/Previews/path-stones-long.png');
    this.load.image('suburb_path_stones_messy', 'assets/kenney/suburban/Previews/path-stones-messy.png');
    this.load.image('suburb_path_stones_short', 'assets/kenney/suburban/Previews/path-stones-short.png');
    
    this.load.image('suburb_planter', 'assets/kenney/suburban/Previews/planter.png');
    this.load.image('suburb_tree_large', 'assets/kenney/suburban/Previews/tree-large.png');
    this.load.image('suburb_tree_small', 'assets/kenney/suburban/Previews/tree-small.png');

    // === AUDIO ===
    this.load.audio('footstep_0', 'assets/festival/audio/footstep_wood_000.ogg');
    this.load.audio('footstep_1', 'assets/festival/audio/footstep_wood_001.ogg');
    this.load.audio('footstep_2', 'assets/festival/audio/footstep_wood_002.ogg');
    this.load.audio('footstep_concrete_0', 'assets/kenney/impacts/Audio/footstep_concrete_000.ogg');
    this.load.audio('footstep_concrete_1', 'assets/kenney/impacts/Audio/footstep_concrete_001.ogg');
    this.load.audio('sfx_metal_click', 'assets/kenney/rpg-audio/Audio/metalClick.ogg');
    this.load.audio('sfx_metal_latch', 'assets/kenney/rpg-audio/Audio/metalLatch.ogg');
    this.load.audio('sfx_metal_pot', 'assets/kenney/rpg-audio/Audio/metalPot1.ogg');
    this.load.audio('sfx_coins', 'assets/kenney/rpg-audio/Audio/handleCoins.ogg');
    this.load.audio('bgm_india_rhythm', 'assets/audio/festival/india-rhythm.mp3');
    this.load.audio('bgm_tabla_tune', 'assets/audio/festival/tabla-tune.mp3');
    this.load.audio('sfx_crowd', 'assets/audio/festival/crowd-shouting.ogg');
    this.load.audio('sfx_bell_correct', 'assets/audio/festival/correct-bell.wav');
    this.load.audio('sfx_bell_pleasing', 'assets/audio/festival/pleasing-bell.wav');

    // === FLOWER PIECES (for match-3 game) ===
    this.load.image('flower_marigold', 'assets/v2/flowers/pieces/marigold.png');
    this.load.image('flower_rose', 'assets/v2/flowers/pieces/rose.png');
    this.load.image('flower_lotus', 'assets/v2/flowers/pieces/lotus.png');
    this.load.image('flower_jasmine', 'assets/v2/flowers/pieces/jasmine.png');
    this.load.image('flower_hibiscus', 'assets/v2/flowers/pieces/hibiscus.png');
    this.load.image('flower_burst', 'assets/v2/flowers/pieces/burst.png');
  }

  create() {
    this.time.delayedCall(400, () => {
      this.scene.start('PrologueScene');
    });
  }
}
