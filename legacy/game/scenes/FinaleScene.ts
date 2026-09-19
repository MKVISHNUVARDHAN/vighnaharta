import Phaser from "phaser";
import { Procession } from "../entities/Procession";
import { EventBus } from "@/game/EventBus";
import type { RunStats, Vec2 } from "@/types/game";

const WORLD_W = 1920;
const WORLD_H = 1700;

export class FinaleScene extends Phaser.Scene {
  constructor() { super({ key: "FinaleScene" }); }

  create(data: { stats: RunStats; paths: Vec2[][] }) {
    const { width, height } = this.scale;
    const city = this.add.image(width / 2, height / 2, "festival-map").setDisplaySize(width, height).setTint(0xa9b4cc);
    const shade = this.add.rectangle(0, 0, width, height, 0x030713, 0.48).setOrigin(0);
    const water = this.add.rectangle(0, height * 0.62, width, height * 0.38, 0x0b3b5b, 0.72).setOrigin(0).setStrokeStyle(3, 0x4ca2bb, 0.5);
    const steps = this.add.triangle(width / 2, height * 0.61, -170, 80, 170, 80, 105, -50, 0x7d6550, 0.9).setStrokeStyle(3, 0xd6a75d, 0.45);
    const route = this.add.graphics();
    data.paths.forEach((points) => {
      if (!points.length) return;
      const converted = points.map((point) => ({ x: (point.x / WORLD_W) * width, y: (point.y / WORLD_H) * height }));
      route.lineStyle(14, 0xf0a82e, 0.18).beginPath().moveTo(converted[0].x, converted[0].y);
      converted.slice(1).forEach((point) => route.lineTo(point.x, point.y)); route.strokePath();
      route.lineStyle(4, 0xffd975, 0.92).beginPath().moveTo(converted[0].x, converted[0].y);
      converted.slice(1).forEach((point) => route.lineTo(point.x, point.y)); route.strokePath();
    });
    route.setAlpha(0);

    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 * i) / 18;
      this.add.circle(width / 2 + Math.cos(angle) * Math.min(190, width * 0.28), height * 0.7 + Math.sin(angle) * 52, 4, 0xffd35a, 0.9).setBlendMode(Phaser.BlendModes.ADD);
    }

    const procession = new Procession(this, width / 2, height * 0.58).setScale(width < 700 ? 0.42 : 0.58).setDepth(20);
    procession.setMoving(false);
    const eyebrow = this.add.text(width / 2, height * 0.11, "THE SIX NEIGHBOURHOODS FOLLOWED YOUR LIGHT", { fontFamily: "Arial", fontSize: width < 700 ? "9px" : "13px", color: "#9fd7d2", fontStyle: "bold", letterSpacing: 3 }).setOrigin(0.5).setAlpha(0);
    const title = this.add.text(width / 2, height * 0.2, "NIMARJANAM", { fontFamily: "Georgia", fontSize: width < 700 ? "32px" : "54px", color: "#ffd66b", fontStyle: "bold", stroke: "#29170c", strokeThickness: 6 }).setOrigin(0.5).setAlpha(0);
    const subtitle = this.add.text(width / 2, height * 0.28, "GANPATI BAPPA MORYA", { fontFamily: "Arial", fontSize: width < 700 ? "11px" : "15px", color: "#fff0ce", letterSpacing: 5 }).setOrigin(0.5).setAlpha(0);
    const action = this.add.text(width / 2, height * 0.87, "TAP TO OFFER FAREWELL", { fontFamily: "Arial", fontSize: width < 700 ? "11px" : "14px", color: "#08101e", backgroundColor: "#f2b84b", padding: { x: 20, y: 12 }, fontStyle: "bold", letterSpacing: 2 }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0);

    this.tweens.add({ targets: shade, alpha: 0.22, duration: 1400 });
    this.tweens.add({ targets: route, alpha: 1, duration: 1000, delay: 350 });
    this.tweens.add({ targets: [eyebrow, title, subtitle], alpha: 1, y: "-=6", duration: 700, delay: 650, ease: "Cubic.easeOut" });
    this.tweens.add({ targets: action, alpha: 1, duration: 550, delay: 1500 });

    let complete = false;
    action.on("pointerdown", () => {
      if (complete) return; complete = true; action.disableInteractive().setText("MORYA · RETURN AGAIN");
      this.tweens.add({ targets: procession, y: height * 0.69, scale: width < 700 ? 0.34 : 0.47, duration: 2600, ease: "Sine.easeInOut" });
      this.tweens.add({ targets: water, alpha: 0.9, duration: 1600 });
      for (let i = 0; i < 7; i++) {
        const ripple = this.add.ellipse(width / 2, height * 0.72, 80, 24, 0x000000, 0).setStrokeStyle(2, 0x9ce8ee, 0.55).setAlpha(0);
        this.tweens.add({ targets: ripple, scale: 4, alpha: { from: 0.7, to: 0 }, duration: 1900, delay: 600 + i * 250 });
      }
      const petals = this.add.particles(0, 0, "petal", { x: { min: 0, max: width }, y: -20, lifespan: 2600, speedY: { min: 100, max: 230 }, speedX: { min: -80, max: 60 }, quantity: 2, frequency: 75, scale: { start: 0.8, end: 0.1 } });
      this.time.delayedCall(3600, () => {
        title.setText("GANPATI BAPPA MORYA"); subtitle.setText("THE CITY REMEMBERS YOUR LIGHT");
        EventBus.emit("finale-complete", data.stats); petals.destroy();
      });
    });

    this.events.once("shutdown", () => action.removeAllListeners());
    void city; void steps;
  }
}
