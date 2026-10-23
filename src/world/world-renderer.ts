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

    const x0 = 46;
    const y0 = 542;
    const x1 = 446;
    const y1 = 692;
    const zBase = 0;
    const zWater = 5.5;

    // 1. Deep pool basin bottom (sunken tile floor effect)
    const b0 = worldToScreen(x0, y0, zBase);
    const b1 = worldToScreen(x1, y0, zBase);
    const b2 = worldToScreen(x1, y1, zBase);
    const b3 = worldToScreen(x0, y1, zBase);

    this.poolWaterGraphic.poly([b0.x, b0.y, b1.x, b1.y, b2.x, b2.y, b3.x, b3.y]);
    this.poolWaterGraphic.fill({ color: 0x0369a1 }); // Deep ocean blue tile basin

    // 2. Translucent vibrant tropical water surface
    const p0 = worldToScreen(x0, y0, zWater);
    const p1 = worldToScreen(x1, y0, zWater);
    const p2 = worldToScreen(x1, y1, zWater);
    const p3 = worldToScreen(x0, y1, zWater);

    this.poolWaterGraphic.poly([p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y]);
    this.poolWaterGraphic.fill({ color: 0x06b6d4, alpha: 0.84 }); // Vibrant glowing cyan water

    // 3. Inner basin depth shadow along North and East submerged walls
    this.poolWaterGraphic.poly([b0.x, b0.y, b1.x, b1.y, p1.x, p1.y, p0.x, p0.y]);
    this.poolWaterGraphic.fill({ color: 0x0c4a6e, alpha: 0.55 });

    // 4. Crisp white swimming lane divider lines
    const l1_start = worldToScreen(x0 + 10, 590, zWater + 0.2);
    const l1_end = worldToScreen(x1 - 10, 590, zWater + 0.2);
    this.poolWaterGraphic.moveTo(l1_start.x, l1_start.y);
    this.poolWaterGraphic.lineTo(l1_end.x, l1_end.y);
    this.poolWaterGraphic.stroke({ color: 0xffffff, alpha: 0.65, width: 2 });

    const l2_start = worldToScreen(x0 + 10, 642, zWater + 0.2);
    const l2_end = worldToScreen(x1 - 10, 642, zWater + 0.2);
    this.poolWaterGraphic.moveTo(l2_start.x, l2_start.y);
    this.poolWaterGraphic.lineTo(l2_end.x, l2_end.y);
    this.poolWaterGraphic.stroke({ color: 0xffffff, alpha: 0.65, width: 2 });

    // 5. Animated sparkling water shimmer / caustic wave lines
    const w1 = Math.sin(time * 2.2) * 4;
    const w2 = Math.cos(time * 1.8) * 3;
    const w3 = Math.sin(time * 2.8 + 1) * 3.5;

    // Lane 1 shimmer
    const s1_a = worldToScreen(x0 + 40, 565 + w1, zWater + 0.3);
    const s1_b = worldToScreen(x0 + 170, 565 + w1, zWater + 0.3);
    this.poolWaterGraphic.moveTo(s1_a.x, s1_a.y);
    this.poolWaterGraphic.lineTo(s1_b.x, s1_b.y);
    this.poolWaterGraphic.stroke({ color: 0xa5f3fc, alpha: 0.75, width: 1.8 });

    // Lane 2 shimmer
    const s2_a = worldToScreen(x0 + 200, 615 + w2, zWater + 0.3);
    const s2_b = worldToScreen(x0 + 350, 615 + w2, zWater + 0.3);
    this.poolWaterGraphic.moveTo(s2_a.x, s2_a.y);
    this.poolWaterGraphic.lineTo(s2_b.x, s2_b.y);
    this.poolWaterGraphic.stroke({ color: 0xa5f3fc, alpha: 0.75, width: 1.8 });

    // Lane 3 shimmer
    const s3_a = worldToScreen(x0 + 80, 668 + w3, zWater + 0.3);
    const s3_b = worldToScreen(x0 + 260, 668 + w3, zWater + 0.3);
    this.poolWaterGraphic.moveTo(s3_a.x, s3_a.y);
    this.poolWaterGraphic.lineTo(s3_b.x, s3_b.y);
    this.poolWaterGraphic.stroke({ color: 0xa5f3fc, alpha: 0.75, width: 1.8 });

    // 6. Water meniscus highlight where water meets tile rim (North & West edge)
    this.poolWaterGraphic.moveTo(p0.x, p0.y);
    this.poolWaterGraphic.lineTo(p1.x, p1.y);
    this.poolWaterGraphic.stroke({ color: 0xe0f2fe, alpha: 0.8, width: 1.5 });
    this.poolWaterGraphic.moveTo(p0.x, p0.y);
    this.poolWaterGraphic.lineTo(p3.x, p3.y);
    this.poolWaterGraphic.stroke({ color: 0xe0f2fe, alpha: 0.8, width: 1.5 });
  }

  /**
   * Subdivides long or wide 3D boxes into smaller segments so isometric depth sorting
   * is mathematically accurate across the entire length/width, preventing walls or
   * large furniture from clipping over characters.
   */
  private segmentBox(box: Box3D, maxLen: number = 48): Box3D[] {
    if (box.isRound) return [box];
    if (box.w <= maxLen && box.d <= maxLen) return [box];

    const numX = Math.max(1, Math.ceil(box.w / maxLen));
    const numY = Math.max(1, Math.ceil(box.d / maxLen));
    const segW = box.w / numX;
    const segD = box.d / numY;

    const result: Box3D[] = [];
    for (let ix = 0; ix < numX; ix++) {
      for (let iy = 0; iy < numY; iy++) {
        result.push({
          ...box,
          x: box.x + ix * segW,
          y: box.y + iy * segD,
          w: segW,
          d: segD
        });
      }
    }
    return result;
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
        // Front walls and inner partition walls are segmented and sorted by local depth
        const segments = this.segmentBox(wall, 48);
        for (const seg of segments) {
          const g = this.createBoxGraphic(seg);
          const depth = getDepth(seg.x + seg.w / 2, seg.y + seg.d, seg.z || 0);
          g.zIndex = depth;
          this.objectsContainer.addChild(g);
        }
      }
    }

    // 2. Furniture items (placed in objectsContainer with fine-tuned depth sorting)
    for (const item of FURNITURE) {
      if (item.isRound) {
        const g = this.createBoxGraphic(item);
        if (item.w === 160) {
          // Ruang Meeting large round table: depth -375 ensures all 3 North chairs (-385 to -505)
          // sit behind the table, and all 3 South chairs (-251 to -371) sit in front
          g.zIndex = -375;
        } else if (item.w === 72) {
          // Pantry round dining table: depth set to center-front
          g.zIndex = getDepth(item.x + item.w / 2, item.y + item.d * 0.55, item.z || 0);
        } else if (item.w === 90 && item.d === 36) {
          // Ruang Santai coffee table: depth at center
          g.zIndex = getDepth(item.x + item.w / 2, item.y + item.d / 2, item.z || 0);
        } else {
          // Plant pots, beanbag, umbrella and round decor
          g.zIndex = getDepth(item.x + item.w / 2, item.y + item.d, item.z || 0);
        }
        this.objectsContainer.addChild(g);
      } else {
        const isChair = item.w === 20 && item.d === 20 && item.h === 10;
        if (isChair) {
          const g = this.createBoxGraphic(item);
          // Subtract 4 so characters sitting on the chair always render ON TOP of the chair seat
          g.zIndex = getDepth(item.x + item.w / 2, item.y + item.d / 2, item.z || 0) - 4;
          this.objectsContainer.addChild(g);
        } else {
          // Subdivide wide furniture (billiard table, desks, sofas, cabinets)
          const segments = this.segmentBox(item, 48);
          for (const seg of segments) {
            const g = this.createBoxGraphic(seg);
            const depth = getDepth(seg.x + seg.w / 2, seg.y + seg.d, seg.z || 0);
            g.zIndex = depth;
            this.objectsContainer.addChild(g);

            if (item.isRack) {
              this.serverLeds.push(g);
            }
          }
        }
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
      // True 3D isometric cylinder / oval pedestal
      const centerX = box.x + box.w / 2;
      const centerY = box.y + box.d / 2;
      const radiusX = box.w / 2;
      const radiusY = box.d / 2;

      const N = 32;
      const topPts: { x: number; y: number }[] = [];
      const basePts: { x: number; y: number }[] = [];

      for (let i = 0; i < N; i++) {
        const theta = (i / N) * 2 * Math.PI;
        const wx = centerX + radiusX * Math.cos(theta);
        const wy = centerY + radiusY * Math.sin(theta);
        topPts.push(worldToScreen(wx, wy, zTop));
        basePts.push(worldToScreen(wx, wy, zBase));
      }

      // Draw visible front-facing curved hull quads
      if (box.h > 0) {
        for (let i = 0; i < N; i++) {
          const next = (i + 1) % N;
          const midTheta = ((i + 0.5) / N) * 2 * Math.PI;
          // Dot product with camera vector (-1, +1): -cos(theta) + sin(theta)
          const viewDot = -Math.cos(midTheta) + Math.sin(midTheta);
          if (viewDot >= -0.05) {
            const westWeight = Math.max(0, -Math.cos(midTheta));
            const southWeight = Math.max(0, Math.sin(midTheta));
            const shadeColor = westWeight > southWeight ? westColor : southColor;

            g.poly([
              topPts[i].x, topPts[i].y,
              topPts[next].x, topPts[next].y,
              basePts[next].x, basePts[next].y,
              basePts[i].x, basePts[i].y
            ]);
            g.fill({ color: shadeColor });
          }
        }
      }

      // Draw top ellipse polygon
      const topPolyCoords: number[] = [];
      for (let i = 0; i < N; i++) {
        topPolyCoords.push(topPts[i].x, topPts[i].y);
      }
      g.poly(topPolyCoords);
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

    // Filing cabinet / credenza detail in Ruang Kerja
    if (box.color === '#a9824f' && box.h === 20 && box.d === 18) {
      // Horizontal drawer divider line
      const divX1 = b3.x + (t3.x - b3.x) * 0.5;
      const divY1 = b3.y + (t3.y - b3.y) * 0.5;
      const divX2 = b2.x + (t2.x - b2.x) * 0.5;
      const divY2 = b2.y + (t2.y - b2.y) * 0.5;
      g.moveTo(divX1, divY1);
      g.lineTo(divX2, divY2);
      g.stroke({ color: darkenColor(box.color, 0.45), width: 1.5 });

      // Metallic handles
      const h1x = divX1 + (divX2 - divX1) * 0.3;
      const h1y = divY1 + (divY2 - divY1) * 0.3;
      const h2x = divX1 + (divX2 - divX1) * 0.7;
      const h2y = divY1 + (divY2 - divY1) * 0.7;
      g.circle(h1x, h1y - 3, 1.8);
      g.circle(h1x, h1y + 3, 1.8);
      g.circle(h2x, h2y - 3, 1.8);
      g.circle(h2x, h2y + 3, 1.8);
      g.fill({ color: 0xe2e8f0 });
    }

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
