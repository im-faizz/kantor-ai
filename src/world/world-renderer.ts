import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { ROOMS, WALLS, FURNITURE, ROOM_LABELS } from './map-data';
import { worldToScreen, getDepth, darkenColor, parseHexColor, COS_55 } from './iso';
import { Box3D } from './types';

export class WorldRenderer {
  public rootContainer: Container;
  public floorContainer: Container;
  public backWallsContainer: Container;
  public objectsContainer: Container;
  public labelsContainer: Container;

  private serverLeds: Graphics[] = [];
  private poolWaterGraphic: Graphics | null = null;
  private animTimer: number = 0;

  constructor() {
    this.rootContainer = new Container();
    this.floorContainer = new Container();
    this.backWallsContainer = new Container();
    this.objectsContainer = new Container();
    this.labelsContainer = new Container();

    this.objectsContainer.sortableChildren = true;

    // Render layers: floors -> back walls -> dynamic sorted objects (furniture + inner walls + agents) -> labels
    this.rootContainer.addChild(this.floorContainer);
    this.rootContainer.addChild(this.backWallsContainer);
    this.rootContainer.addChild(this.objectsContainer);
    this.rootContainer.addChild(this.labelsContainer);

    this.buildFloors();
    this.buildWallsAndFurniture();
    this.buildRoomLabels();
  }

  private buildFloors() {
    const floorG = new Graphics();

    // Draw all 8 rooms
    for (const room of ROOMS) {
      const p0 = worldToScreen(room.x0, room.y0, 0);
      const p1 = worldToScreen(room.x1, room.y0, 0);
      const p2 = worldToScreen(room.x1, room.y1, 0);
      const p3 = worldToScreen(room.x0, room.y1, 0);

      const color = parseHexColor(room.floorColor);

      floorG.poly([p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y]);
      floorG.fill({ color });
      floorG.stroke({ color: darkenColor(room.floorColor, 0.1), width: 1 });
    }

    this.floorContainer.addChild(floorG);

    // Pool water at elevation z = 8.6
    this.poolWaterGraphic = new Graphics();
    this.drawPoolWater(0);
    this.floorContainer.addChild(this.poolWaterGraphic);
  }

  private drawPoolWater(time: number) {
    if (!this.poolWaterGraphic) return;
    this.poolWaterGraphic.clear();

    const x0 = 44;
    const y0 = 540;
    const x1 = 44 + 404;
    const y1 = 540 + 154;
    const z = 8.6;

    const p0 = worldToScreen(x0, y0, z);
    const p1 = worldToScreen(x1, y0, z);
    const p2 = worldToScreen(x1, y1, z);
    const p3 = worldToScreen(x0, y1, z);

    // Water base polygon
    this.poolWaterGraphic.poly([p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y]);
    this.poolWaterGraphic.fill({ color: 0x0ea5e9, alpha: 0.92 });

    // Lane divider lines at y = 590 and y = 642
    const l1_start = worldToScreen(x0, 590, z + 0.2);
    const l1_end = worldToScreen(x1, 590, z + 0.2);
    this.poolWaterGraphic.moveTo(l1_start.x, l1_start.y);
    this.poolWaterGraphic.lineTo(l1_end.x, l1_end.y);
    this.poolWaterGraphic.stroke({ color: 0xffffff, alpha: 0.55, width: 2 });

    const l2_start = worldToScreen(x0, 642, z + 0.2);
    const l2_end = worldToScreen(x1, 642, z + 0.2);
    this.poolWaterGraphic.moveTo(l2_start.x, l2_start.y);
    this.poolWaterGraphic.lineTo(l2_end.x, l2_end.y);
    this.poolWaterGraphic.stroke({ color: 0xffffff, alpha: 0.55, width: 2 });

    // Animated water shimmer lines
    const waveOffset = Math.sin(time * 2) * 3;
    const s1 = worldToScreen(x0 + 60, 560 + waveOffset, z + 0.3);
    const s2 = worldToScreen(x0 + 180, 560 + waveOffset, z + 0.3);
    this.poolWaterGraphic.moveTo(s1.x, s1.y);
    this.poolWaterGraphic.lineTo(s2.x, s2.y);
    this.poolWaterGraphic.stroke({ color: 0x67e8f9, alpha: 0.45, width: 1.5 });
  }

  private buildWallsAndFurniture() {
    // 1. Back outer walls (North and East boundary walls):
    // They form the rear backdrop of the entire office and are placed in backWallsContainer
    // so they never incorrectly overlap ("nimpa") interior rooms, furniture, or characters.
    for (const wall of WALLS) {
      const isNorthBackWall = wall.y <= 0 && wall.h === 46;
      const isEastBackWall = wall.x >= 950 && wall.h === 46;

      if (isNorthBackWall || isEastBackWall) {
        const g = this.createBoxGraphic(wall);
        this.backWallsContainer.addChild(g);
      } else {
        // Front walls and inner partition walls go to objectsContainer to properly occlude
        const g = this.createBoxGraphic(wall);
        const depth = getDepth(wall.x + wall.w / 2, wall.y + wall.d, wall.z || 0);
        g.zIndex = depth;
        this.objectsContainer.addChild(g);
      }
    }

    // 2. Furniture items (placed in objectsContainer with accurate center-front depth)
    for (const item of FURNITURE) {
      const g = this.createBoxGraphic(item);
      // For chairs, use center depth so seated agents render naturally
      const isChair = item.w === 20 && item.d === 20 && item.h === 10;
      const depthY = isChair ? item.y + item.d / 2 : item.y + item.d;
      const depth = getDepth(item.x + item.w / 2, depthY, item.z || 0);
      g.zIndex = depth;
      this.objectsContainer.addChild(g);

      if (item.isRack) {
        this.serverLeds.push(g);
      }
    }

    this.sortObjects();
  }

  private createBoxGraphic(box: Box3D): Graphics {
    const g = new Graphics();
    const zBase = box.z || 0;
    const zTop = zBase + box.h;
    const baseColor = parseHexColor(box.color);
    const southColor = darkenColor(box.color, 0.24);
    const westColor = darkenColor(box.color, 0.40);

    if (box.isRound) {
      // Cylinder / round pedestal
      const centerX = box.x + box.w / 2;
      const centerY = box.y + box.d / 2;
      const rx = box.w / 2;
      const ry = (box.w / 2) * COS_55;

      const baseCenter = worldToScreen(centerX, centerY, zBase);
      const topCenter = worldToScreen(centerX, centerY, zTop);

      // Curved side hull
      if (box.h > 0) {
        g.poly([
          topCenter.x - rx, topCenter.y,
          topCenter.x + rx, topCenter.y,
          baseCenter.x + rx, baseCenter.y,
          baseCenter.x - rx, baseCenter.y
        ]);
        g.fill({ color: southColor });

        // Bottom curved rim
        g.ellipse(baseCenter.x, baseCenter.y, rx, ry);
        g.fill({ color: westColor });
      }

      // Top ellipse
      g.ellipse(topCenter.x, topCenter.y, rx, ry);
      g.fill({ color: baseColor });
      g.stroke({ color: darkenColor(box.color, 0.15), width: 1 });

      return g;
    }

    // Standard 3D rectangular box
    const b0 = worldToScreen(box.x, box.y, zBase);
    const b1 = worldToScreen(box.x + box.w, box.y, zBase);
    const b2 = worldToScreen(box.x + box.w, box.y + box.d, zBase);
    const b3 = worldToScreen(box.x, box.y + box.d, zBase);

    const t0 = worldToScreen(box.x, box.y, zTop);
    const t1 = worldToScreen(box.x + box.w, box.y, zTop);
    const t2 = worldToScreen(box.x + box.w, box.y + box.d, zTop);
    const t3 = worldToScreen(box.x, box.y + box.d, zTop);

    // 1. West Face (-X front-left side): b0 -> b3 -> t3 -> t0
    g.poly([b0.x, b0.y, b3.x, b3.y, t3.x, t3.y, t0.x, t0.y]);
    g.fill({ color: westColor });

    // 2. South Face (+Y front-right side): b3 -> b2 -> t2 -> t3
    g.poly([b3.x, b3.y, b2.x, b2.y, t2.x, t2.y, t3.x, t3.y]);
    g.fill({ color: southColor });

    // 3. Top Face (+Z face): t0 -> t1 -> t2 -> t3
    g.poly([t0.x, t0.y, t1.x, t1.y, t2.x, t2.y, t3.x, t3.y]);
    g.fill({ color: baseColor });
    g.stroke({ color: darkenColor(box.color, 0.12), width: 1 });

    // Server rack special: blinking LED lights on South Face
    if (box.isRack) {
      const ledSteps = 8;
      for (let i = 1; i < ledSteps; i++) {
        const frac = i / ledSteps;
        const lx1 = b3.x + (t3.x - b3.x) * frac;
        const ly1 = b3.y + (t3.y - b3.y) * frac;
        const lx2 = b2.x + (t2.x - b2.x) * frac;
        const ly2 = b2.y + (t2.y - b2.y) * frac;

        g.moveTo(lx1, ly1);
        g.lineTo(lx2, ly2);
        const isBlinking = i % 2 === 0;
        g.stroke({ color: isBlinking ? 0x22c55e : 0x0f172a, width: 2 });
      }
    }

    return g;
  }

  private buildRoomLabels() {
    for (const label of ROOM_LABELS) {
      const pos = worldToScreen(label.x, label.y, 48);

      const labelContainer = new Container();
      labelContainer.position.set(pos.x, pos.y);

      const text = new Text({
        text: label.name,
        style: new TextStyle({
          fontFamily: 'Lilita One, sans-serif',
          fontSize: 14,
          fill: 0xffffff,
          letterSpacing: 0.5,
          align: 'center'
        })
      });
      text.anchor.set(0.5, 0.5);

      const bg = new Graphics();
      const padX = 12;
      const padY = 4;
      const w = text.width + padX * 2;
      const h = text.height + padY * 2;

      bg.roundRect(-w / 2, -h / 2, w, h, 8);
      bg.fill({ color: 0x0b1220, alpha: 0.85 });
      bg.stroke({ color: 0x334155, width: 1.5 });

      labelContainer.addChild(bg);
      labelContainer.addChild(text);

      this.labelsContainer.addChild(labelContainer);
    }
  }

  public sortObjects() {
    this.objectsContainer.sortChildren();
  }

  public update(deltaTime: number) {
    this.animTimer += deltaTime;

    // Update pool water
    this.drawPoolWater(this.animTimer);

    // Re-sort dynamic objects every frame so walking agents smoothly pass behind and in front of furniture
    this.sortObjects();
  }
}
