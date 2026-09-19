import Phaser from 'phaser';

export class Gate extends Phaser.GameObjects.Container {
  public isActive: boolean = false;
  private leftBar: Phaser.GameObjects.Rectangle;
  private rightBar: Phaser.GameObjects.Rectangle;
  private multiplierText: Phaser.GameObjects.Text;
  private _isOpen: boolean = true;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.leftBar = scene.add.rectangle(-30, 0, 10, 40, 0xffffff);
    this.rightBar = scene.add.rectangle(30, 0, 10, 40, 0xffffff);
    this.multiplierText = scene.add.text(0, -30, '', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);

    this.add([this.leftBar, this.rightBar, this.multiplierText]);
    scene.add.existing(this);
    this.setVisible(false);
  }

  activate(type: 'festival' | 'risk', x: number, y: number, multiplier: number) {
    this.setPosition(x, y);
    this.isActive = true;
    this.setVisible(true);
    this._isOpen = true;

    const color = type === 'festival' ? 0xffd700 : 0xff0000;
    this.leftBar.setFillStyle(color);
    this.rightBar.setFillStyle(color);
    this.multiplierText.setText(`x${multiplier}`);
    this.multiplierText.setColor(type === 'festival' ? '#ffd700' : '#ff0000');
  }

  deactivate() {
    this.isActive = false;
    this.setVisible(false);
  }

  isOpen(): boolean {
    return this._isOpen;
  }
}
