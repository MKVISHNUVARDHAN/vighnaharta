import Phaser from 'phaser';

export interface TutorialConfig {
  title: string;
  objective: string;
  controls: { key: string; action: string }[];
  tips: string[];
  accentColor?: number;
  onDismiss?: () => void;
}

export class TutorialOverlay {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;
  private dismissed = false;
  private config?: TutorialConfig;
  private autoDismissTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(config: TutorialConfig): void {
    if (this.container) {
      this.destroy();
    }
    this.config = config;
    this.dismissed = false;

    const { width, height } = this.scene.scale;
    const accentColor = config.accentColor !== undefined ? config.accentColor : 0xffd700;

    this.container = this.scene.add.container(width / 2, height / 2);
    this.container.setDepth(50000);

    // Dark semi-transparent background
    const bg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.75);
    bg.setOrigin(0.5);
    this.container.add(bg);
    
    // Make bg interactive to block clicks propagating beneath
    bg.setInteractive();

    let currentY = -height * 0.3;

    // Title
    const titleText = this.scene.add.text(0, currentY, config.title.toUpperCase(), {
      fontFamily: 'Arial, sans-serif',
      fontSize: '48px',
      fontStyle: 'bold',
      color: `#${accentColor.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
    }).setOrigin(0.5);
    this.container.add(titleText);
    currentY += 60;

    // Objective
    const objectiveText = this.scene.add.text(0, currentY, config.objective, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'italic',
      color: '#ffffff',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
    }).setOrigin(0.5);
    this.container.add(objectiveText);
    currentY += 80;

    // Controls Section
    if (config.controls && config.controls.length > 0) {
      const controlsTitle = this.scene.add.text(0, currentY, 'CONTROLS', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#aaaaaa',
        letterSpacing: 2
      }).setOrigin(0.5);
      this.container.add(controlsTitle);
      currentY += 40;

      config.controls.forEach(ctrl => {
        // Key box
        const keyBoxWidth = Math.max(60, ctrl.key.length * 15 + 20);
        const keyBox = this.scene.add.graphics();
        keyBox.lineStyle(2, accentColor, 1);
        keyBox.fillStyle(0x333333, 0.8);
        keyBox.fillRoundedRect(-keyBoxWidth / 2 - 100, currentY - 20, keyBoxWidth, 40, 8);
        keyBox.strokeRoundedRect(-keyBoxWidth / 2 - 100, currentY - 20, keyBoxWidth, 40, 8);
        
        const keyText = this.scene.add.text(-100, currentY, ctrl.key, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '22px',
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0.5);

        const actionText = this.scene.add.text(-40 + keyBoxWidth / 2, currentY, ctrl.action, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '22px',
          color: '#dddddd'
        }).setOrigin(0, 0.5);

        this.container?.add([keyBox, keyText, actionText]);
        currentY += 50;
      });
      currentY += 30;
    }

    // Tips Section
    if (config.tips && config.tips.length > 0) {
      const tipsTitle = this.scene.add.text(0, currentY, 'TIPS', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#aaaaaa',
        letterSpacing: 2
      }).setOrigin(0.5);
      this.container.add(tipsTitle);
      currentY += 40;

      config.tips.forEach(tip => {
        const tipText = this.scene.add.text(0, currentY, `✦ ${tip}`, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '20px',
          color: '#cccccc'
        }).setOrigin(0.5);
        this.container?.add(tipText);
        currentY += 30;
      });
    }

    // Pulsing continue text
    const continueText = this.scene.add.text(0, height * 0.35, 'TAP OR PRESS ANY KEY TO START', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: `#${accentColor.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5);
    this.container.add(continueText);

    this.scene.tweens.add({
      targets: continueText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Entrance Animation
    this.container.setScale(0.8);
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });

    // Input listeners (with a slight delay to avoid immediate trigger if tapped from previous scene)
    this.scene.time.delayedCall(200, () => {
      if (this.dismissed) return;
      this.scene.input.keyboard?.once('keydown', this.dismiss, this);
      this.scene.input.once('pointerdown', this.dismiss, this);
    });

    // Auto-dismiss timer
    this.autoDismissTimer = this.scene.time.delayedCall(3500, this.dismiss, [], this);
  }

  private dismiss(): void {
    if (this.dismissed) return;
    this.dismissed = true;

    // Remove listeners
    this.scene.input.keyboard?.off('keydown', this.dismiss, this, false);
    this.scene.input.off('pointerdown', this.dismiss, this, false);

    if (this.autoDismissTimer) {
      this.autoDismissTimer.remove();
      this.autoDismissTimer = undefined;
    }

    if (!this.container) return;

    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.1,
      scaleY: 1.1,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        if (this.config?.onDismiss) {
          this.config.onDismiss();
        }
        this.destroy();
      }
    });
  }

  destroy(): void {
    if (this.autoDismissTimer) {
      this.autoDismissTimer.remove();
      this.autoDismissTimer = undefined;
    }
    this.scene.input.keyboard?.off('keydown', this.dismiss, this, false);
    this.scene.input.off('pointerdown', this.dismiss, this, false);
    
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
  }
}
