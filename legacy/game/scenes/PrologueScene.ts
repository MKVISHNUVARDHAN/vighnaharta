import Phaser from 'phaser';

export class PrologueScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PrologueScene' });
    }

    create() {
        // Check if prologue was already seen
        const hasSeenPrologue = localStorage.getItem('vighnaharta-seen-prologue');
        if (hasSeenPrologue === 'true') {
            this.startGame();
            return;
        }

        // Set background color
        this.cameras.main.setBackgroundColor(0x0a0a1a);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;

        const textStyle = {
            fontSize: '28px',
            fontFamily: 'Georgia, serif',
            color: '#ffffff',
            wordWrap: { width: 700, useAdvancedWrap: true },
            align: 'center'
        };

        // Skip button
        const skipBtn = this.add.text(width - 40, height - 40, 'SKIP ▶', {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true }).setAlpha(0.6);

        skipBtn.on('pointerover', () => skipBtn.setAlpha(1));
        skipBtn.on('pointerout', () => skipBtn.setAlpha(0.6));
        skipBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.startGame();
            });
        });

        // Start fading in
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.time.delayedCall(1000, () => this.playPanel1(centerX, centerY, textStyle));
    }

    private playPanel1(x: number, y: number, style: any) {
        const text = this.add.text(x, y - 50, 'Every year, the city carries Lord Ganesha to the sacred waters...', style)
            .setOrigin(0.5)
            .setAlpha(0);

        const glow = this.add.circle(x, y + 80, 5, 0xffd700, 0.4).setAlpha(0);

        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                this.tweens.add({
                    targets: glow,
                    alpha: 1,
                    scale: 20,
                    duration: 2000,
                    ease: 'Sine.easeOut',
                    onComplete: () => {
                        this.time.delayedCall(3000, () => {
                            this.transitionToNext(text, [glow], () => this.playPanel2(x, y, style));
                        });
                    }
                });
            }
        });
    }

    private playPanel2(x: number, y: number, style: any) {
        const text = this.add.text(x, y - 80, 'But this year, six obstacles block the procession road.', style)
            .setOrigin(0.5)
            .setAlpha(0);

        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                const xs: Phaser.GameObjects.Text[] = [];
                for(let i=0; i<6; i++) {
                    const xMark = this.add.text(x - 125 + (i * 50), y + 50, 'X', {
                        fontSize: '40px',
                        color: '#ff0000',
                        fontFamily: 'Arial, sans-serif',
                        fontStyle: 'bold'
                    }).setOrigin(0.5).setAlpha(0);
                    xs.push(xMark);
                }

                this.tweens.add({
                    targets: xs,
                    alpha: 1,
                    scale: { from: 2, to: 1 },
                    duration: 400,
                    ease: 'Bounce.easeOut',
                    delay: this.tweens.stagger(300, {}),
                    onComplete: () => {
                        this.time.delayedCall(2500, () => {
                            this.transitionToNext(text, xs, () => this.playPanel3(x, y, style));
                        });
                    }
                });
            }
        });
    }

    private playPanel3(x: number, y: number, style: any) {
        const text = this.add.text(x, y - 100, "Mooshak, Ganesha's faithful mouse, volunteers to scout ahead.", style)
            .setOrigin(0.5)
            .setAlpha(0);

        let mooshak: Phaser.GameObjects.Image | null = null;
        if (this.textures.exists('mooshak-scout')) {
            mooshak = this.add.image(x - 300, y + 80, 'mooshak-scout').setScale(0.3).setAlpha(0);
        } else {
            // fallback
            mooshak = this.add.rectangle(x - 300, y + 80, 100, 100, 0x888888) as any;
            mooshak!.setAlpha(0);
        }

        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                if (mooshak) {
                    this.tweens.add({
                        targets: mooshak,
                        x: x,
                        alpha: 1,
                        duration: 1500,
                        ease: 'Power2',
                        onComplete: () => {
                            this.time.delayedCall(2500, () => {
                                this.transitionToNext(text, [mooshak!], () => this.playPanel4(x, y, style));
                            });
                        }
                    });
                }
            }
        });
    }

    private playPanel4(x: number, y: number, style: any) {
        const text = this.add.text(x, y, 'Clear every obstacle.\nThe procession is counting on you.', {
            ...style,
            color: '#ffd700'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 1500,
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.cameras.main.fadeOut(1000, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.startGame();
                    });
                });
            }
        });
    }

    private transitionToNext(text: Phaser.GameObjects.Text, others: Phaser.GameObjects.GameObject[], onComplete: () => void) {
        this.tweens.add({
            targets: [text, ...others],
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                text.destroy();
                others.forEach(o => o.destroy());
                onComplete();
            }
        });
    }

    private startGame() {
        // Mark as seen
        localStorage.setItem('vighnaharta-seen-prologue', 'true');
        this.scene.start('GameScene');
    }
}
