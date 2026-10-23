import { Container, Sprite, Texture, Text, TextStyle, Graphics } from 'pixi.js';
import { AgentDef, ActivityType } from '../data/agents';
import { worldToScreen, getDepth, Point2D } from '../world/iso';

export interface AgentTextures {
  head: Texture;
  torso: Texture;
  armL: Texture;
  armR: Texture;
  legL: Texture;
  legR: Texture;
  cup: Texture;
  cue: Texture;
  shadow: Texture;
  ring: Texture;
  ripple: Texture;
  zzz: Texture;
}

/**
 * Creates GPU textures for an agent once by rendering clean 2D vector shapes.
 */
export function createAgentTextures(def: AgentDef): AgentTextures {
  const scale = 2; // High-DPI crisp rendering

  // 1. Shadow texture (26x12)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 26 * scale;
  shadowCanvas.height = 12 * scale;
  const sCtx = shadowCanvas.getContext('2d')!;
  sCtx.scale(scale, scale);
  sCtx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  sCtx.beginPath();
  sCtx.ellipse(13, 6, 13, 6, 0, 0, Math.PI * 2);
  sCtx.fill();
  const shadow = Texture.from(shadowCanvas);

  // 2. Selection ring texture (38x38)
  const ringCanvas = document.createElement('canvas');
  ringCanvas.width = 38 * scale;
  ringCanvas.height = 38 * scale;
  const rCtx = ringCanvas.getContext('2d')!;
  rCtx.scale(scale, scale);
  rCtx.strokeStyle = '#fde047';
  rCtx.lineWidth = 3;
  rCtx.beginPath();
  rCtx.ellipse(19, 19, 16, 16, 0, 0, Math.PI * 2);
  rCtx.stroke();
  const ring = Texture.from(ringCanvas);

  // 3. Water ripple texture (44x44)
  const ripCanvas = document.createElement('canvas');
  ripCanvas.width = 44 * scale;
  ripCanvas.height = 44 * scale;
  const rpCtx = ripCanvas.getContext('2d')!;
  rpCtx.scale(scale, scale);
  rpCtx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  rpCtx.lineWidth = 2.5;
  rpCtx.beginPath();
  rpCtx.ellipse(22, 22, 18, 18, 0, 0, Math.PI * 2);
  rpCtx.stroke();
  const ripple = Texture.from(ripCanvas);

  // 4. Head texture (44x34)
  const headCanvas = document.createElement('canvas');
  headCanvas.width = 44 * scale;
  headCanvas.height = 34 * scale;
  const hCtx = headCanvas.getContext('2d')!;
  hCtx.scale(scale, scale);

  // Face skin
  hCtx.fillStyle = def.skin;
  hCtx.beginPath();
  hCtx.arc(22, 17, 13, 0, Math.PI * 2);
  hCtx.fill();

  // Hair
  hCtx.fillStyle = def.hair;
  hCtx.beginPath();
  // Hair contour: M9 17 C8 4 20 0 25 2 C33 3 36 10 35 17 C32 11 27 9 22 9 C17 9 12 11 9 17Z
  hCtx.moveTo(9, 17);
  hCtx.bezierCurveTo(8, 4, 20, 0, 25, 2);
  hCtx.bezierCurveTo(33, 3, 36, 10, 35, 17);
  hCtx.bezierCurveTo(32, 11, 27, 9, 22, 9);
  hCtx.bezierCurveTo(17, 9, 12, 11, 9, 17);
  hCtx.closePath();
  hCtx.fill();

  // Bun if any
  if (def.bun) {
    hCtx.beginPath();
    hCtx.arc(22, 2, 4.5, 0, Math.PI * 2);
    hCtx.fill();
  }

  // Eyes
  hCtx.fillStyle = '#0b1220';
  hCtx.beginPath();
  hCtx.arc(16.5, 19, 2.2, 0, Math.PI * 2);
  hCtx.arc(27.5, 19, 2.2, 0, Math.PI * 2);
  hCtx.fill();

  // Eye highlights
  hCtx.fillStyle = '#ffffff';
  hCtx.beginPath();
  hCtx.arc(17.2, 18.3, 0.8, 0, Math.PI * 2);
  hCtx.arc(28.2, 18.3, 0.8, 0, Math.PI * 2);
  hCtx.fill();

  // Cheeks
  hCtx.fillStyle = 'rgba(248, 113, 113, 0.35)';
  hCtx.beginPath();
  hCtx.arc(12.5, 23.5, 2.4, 0, Math.PI * 2);
  hCtx.arc(31.5, 23.5, 2.4, 0, Math.PI * 2);
  hCtx.fill();

  // Smile
  hCtx.strokeStyle = '#7f1d1d';
  hCtx.lineWidth = 1.6;
  hCtx.lineCap = 'round';
  hCtx.beginPath();
  hCtx.moveTo(18.5, 25);
  hCtx.quadraticCurveTo(22, 28, 25.5, 25);
  hCtx.stroke();

  // Accessories: Glasses
  if (def.gl) {
    hCtx.strokeStyle = '#0b1220';
    hCtx.lineWidth = 1.4;
    hCtx.beginPath();
    hCtx.arc(16.5, 19, 4.6, 0, Math.PI * 2);
    hCtx.stroke();
    hCtx.beginPath();
    hCtx.arc(27.5, 19, 4.6, 0, Math.PI * 2);
    hCtx.stroke();
    hCtx.beginPath();
    hCtx.moveTo(21.1, 19);
    hCtx.lineTo(22.9, 19);
    hCtx.stroke();
  }

  // Headset
  if (def.hs) {
    hCtx.strokeStyle = '#0b1220';
    hCtx.lineWidth = 2.4;
    hCtx.beginPath();
    hCtx.moveTo(8, 18);
    hCtx.bezierCurveTo(8, 3, 36, 3, 36, 18);
    hCtx.stroke();

    hCtx.fillStyle = '#0b1220';
    hCtx.roundRect(5, 16, 5, 8, 2.5);
    hCtx.roundRect(34, 16, 5, 8, 2.5);
    hCtx.fill();

    // Mic
    hCtx.strokeStyle = '#0b1220';
    hCtx.lineWidth = 1.6;
    hCtx.beginPath();
    hCtx.moveTo(7, 24);
    hCtx.quadraticCurveTo(9, 30, 18, 29);
    hCtx.stroke();
  }

  // Beret
  if (def.be) {
    hCtx.fillStyle = '#ec4899';
    hCtx.beginPath();
    hCtx.ellipse(25, 5, 13, 5, 0, 0, Math.PI * 2);
    hCtx.fill();
  }

  // Cap
  if (def.cp) {
    hCtx.fillStyle = '#2563eb';
    hCtx.beginPath();
    hCtx.moveTo(9, 12);
    hCtx.bezierCurveTo(9, -1, 35, -1, 35, 12);
    hCtx.closePath();
    hCtx.fill();

    hCtx.fillStyle = '#1d4ed8';
    hCtx.beginPath();
    hCtx.roundRect(26, 9, 14, 4, 2);
    hCtx.fill();
  }

  const head = Texture.from(headCanvas);

  // 5. Torso texture (24x22)
  const torsoCanvas = document.createElement('canvas');
  torsoCanvas.width = 24 * scale;
  torsoCanvas.height = 22 * scale;
  const tCtx = torsoCanvas.getContext('2d')!;
  tCtx.scale(scale, scale);
  tCtx.fillStyle = def.shirt;
  tCtx.beginPath();
  tCtx.roundRect(0, 0, 24, 22, 7);
  tCtx.fill();

  // Red tie if manager/marketer
  if (def.tie) {
    tCtx.fillStyle = '#dc2626';
    tCtx.beginPath();
    tCtx.moveTo(12, 2);
    tCtx.lineTo(15, 6);
    tCtx.lineTo(12, 17);
    tCtx.lineTo(9, 6);
    tCtx.closePath();
    tCtx.fill();
  }
  const torso = Texture.from(torsoCanvas);

  // 6. Arm texture (7x17)
  const armCanvas = document.createElement('canvas');
  armCanvas.width = 7 * scale;
  armCanvas.height = 21 * scale;
  const aCtx = armCanvas.getContext('2d')!;
  aCtx.scale(scale, scale);
  // Sleeve
  aCtx.fillStyle = def.shirt;
  aCtx.beginPath();
  aCtx.roundRect(0, 0, 7, 17, 3.5);
  aCtx.fill();
  // Hand
  aCtx.fillStyle = def.skin;
  aCtx.beginPath();
  aCtx.arc(3.5, 17, 3.5, 0, Math.PI * 2);
  aCtx.fill();
  const armL = Texture.from(armCanvas);
  const armR = Texture.from(armCanvas);

  // 7. Leg texture (7x17)
  const legCanvas = document.createElement('canvas');
  legCanvas.width = 7 * scale;
  legCanvas.height = 17 * scale;
  const lCtx = legCanvas.getContext('2d')!;
  lCtx.scale(scale, scale);
  // Pants
  lCtx.fillStyle = '#1e293b';
  lCtx.beginPath();
  lCtx.roundRect(0, 0, 7, 13, 3);
  lCtx.fill();
  // Shoes
  lCtx.fillStyle = '#0b1220';
  lCtx.beginPath();
  lCtx.roundRect(-1, 12, 9, 5, 2.5);
  lCtx.fill();
  const legL = Texture.from(legCanvas);
  const legR = Texture.from(legCanvas);

  // 8. Cup texture (12x10)
  const cupCanvas = document.createElement('canvas');
  cupCanvas.width = 12 * scale;
  cupCanvas.height = 10 * scale;
  const cCtx = cupCanvas.getContext('2d')!;
  cCtx.scale(scale, scale);
  cCtx.fillStyle = '#ffffff';
  cCtx.roundRect(0, 0, 8, 7, 1.5);
  cCtx.fill();
  cCtx.strokeStyle = '#ffffff';
  cCtx.lineWidth = 1.4;
  cCtx.beginPath();
  cCtx.arc(8, 3.5, 2.5, -Math.PI / 2, Math.PI / 2);
  cCtx.stroke();
  const cup = Texture.from(cupCanvas);

  // 9. Cue texture (38x48)
  const cueCanvas = document.createElement('canvas');
  cueCanvas.width = 38 * scale;
  cueCanvas.height = 48 * scale;
  const cueCtx = cueCanvas.getContext('2d')!;
  cueCtx.scale(scale, scale);
  cueCtx.strokeStyle = '#d6a45a';
  cueCtx.lineWidth = 2.4;
  cueCtx.lineCap = 'round';
  cueCtx.beginPath();
  cueCtx.moveTo(0, 44);
  cueCtx.lineTo(34, 4);
  cueCtx.stroke();
  cueCtx.fillStyle = '#3b82f6';
  cueCtx.beginPath();
  cueCtx.arc(34, 4, 1.8, 0, Math.PI * 2);
  cueCtx.fill();
  const cue = Texture.from(cueCanvas);

  // 10. Zzz texture (28x20)
  const zzzCanvas = document.createElement('canvas');
  zzzCanvas.width = 36 * scale;
  zzzCanvas.height = 24 * scale;
  const zCtx = zzzCanvas.getContext('2d')!;
  zCtx.scale(scale, scale);
  zCtx.font = "bold 16px 'Lilita One', sans-serif";
  zCtx.fillStyle = '#ffffff';
  zCtx.shadowColor = '#000000';
  zCtx.shadowBlur = 4;
  zCtx.fillText('Zzz', 2, 18);
  const zzz = Texture.from(zzzCanvas);

  return {
    head,
    torso,
    armL,
    armR,
    legL,
    legR,
    cup,
    cue,
    shadow,
    ring,
    ripple,
    zzz
  };
}

export class AgentSpriteView {
  public def: AgentDef;
  public container: Container;

  public shadowSprite: Sprite;
  public ringSprite: Sprite;
  public rippleSprite: Sprite;

  public billboard: Container;
  public bodyContainer: Container;
  public legLSprite: Sprite;
  public legRSprite: Sprite;
  public torsoSprite: Sprite;
  public armLSprite: Sprite;
  public armRSprite: Sprite;
  public headSprite: Sprite;
  public cupSprite: Sprite;
  public cueSprite: Sprite;
  public zzzSprite: Sprite;

  public badgeContainer: Container;
  public badgeBg: Graphics;
  public nameText: Text;
  public statusText: Text;

  public bubbleContainer: Container;
  public bubbleBg: Graphics;
  public bubbleText: Text;

  public isSelected: boolean = false;
  public currentAct: ActivityType = 'work';
  public isMoving: boolean = false;
  public currentText: string = '';

  private animTimer: number = 0;

  constructor(def: AgentDef, textures: AgentTextures) {
    this.def = def;
    this.container = new Container();
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';

    // 1. Ground elements
    this.shadowSprite = new Sprite(textures.shadow);
    this.shadowSprite.anchor.set(0.5, 0.5);
    this.shadowSprite.position.set(0, 0);

    this.ringSprite = new Sprite(textures.ring);
    this.ringSprite.anchor.set(0.5, 0.5);
    this.ringSprite.position.set(0, 0);
    this.ringSprite.visible = false;

    this.rippleSprite = new Sprite(textures.ripple);
    this.rippleSprite.anchor.set(0.5, 0.5);
    this.rippleSprite.position.set(0, 0);
    this.rippleSprite.visible = false;

    this.container.addChild(this.shadowSprite);
    this.container.addChild(this.ringSprite);
    this.container.addChild(this.rippleSprite);

    // 2. Billboard container
    this.billboard = new Container();
    this.container.addChild(this.billboard);

    // 3. Body container (anchor at bottom center 0,0, character height is 64px)
    this.bodyContainer = new Container();
    this.billboard.addChild(this.bodyContainer);

    // Legs
    this.legLSprite = new Sprite(textures.legL);
    this.legLSprite.anchor.set(0.5, 0);
    this.legLSprite.position.set(-5.5, -18);

    this.legRSprite = new Sprite(textures.legR);
    this.legRSprite.anchor.set(0.5, 0);
    this.legRSprite.position.set(5.5, -18);

    this.bodyContainer.addChild(this.legLSprite);
    this.bodyContainer.addChild(this.legRSprite);

    // Torso (24x22, centered at x=0, y=-37..-15)
    this.torsoSprite = new Sprite(textures.torso);
    this.torsoSprite.anchor.set(0.5, 0.5);
    this.torsoSprite.position.set(0, -26);
    this.bodyContainer.addChild(this.torsoSprite);

    // Arms
    this.armLSprite = new Sprite(textures.armL);
    this.armLSprite.anchor.set(0.5, 0.15);
    this.armLSprite.position.set(-13.5, -34);

    this.armRSprite = new Sprite(textures.armR);
    this.armRSprite.anchor.set(0.5, 0.15);
    this.armRSprite.position.set(13.5, -34);

    // Props attached to right arm
    this.cupSprite = new Sprite(textures.cup);
    this.cupSprite.position.set(-2, 10);
    this.cupSprite.visible = false;
    this.armRSprite.addChild(this.cupSprite);

    this.cueSprite = new Sprite(textures.cue);
    this.cueSprite.position.set(-6, 4);
    this.cueSprite.visible = false;
    this.armRSprite.addChild(this.cueSprite);

    this.bodyContainer.addChild(this.armLSprite);
    this.bodyContainer.addChild(this.armRSprite);

    // Head
    this.headSprite = new Sprite(textures.head);
    this.headSprite.anchor.set(0.5, 0.5);
    this.headSprite.position.set(0, -47);
    this.bodyContainer.addChild(this.headSprite);

    // Zzz indicator
    this.zzzSprite = new Sprite(textures.zzz);
    this.zzzSprite.position.set(12, -72);
    this.zzzSprite.visible = false;
    this.billboard.addChild(this.zzzSprite);

    // 4. Overhead Badge (Name + Short Status)
    this.badgeContainer = new Container();
    this.badgeContainer.position.set(0, -74);

    this.badgeBg = new Graphics();
    this.nameText = new Text({
      text: def.name,
      style: new TextStyle({
        fontFamily: 'Lilita One, sans-serif',
        fontSize: 12,
        fill: 0xffffff,
        letterSpacing: 0.4
      })
    });
    this.nameText.anchor.set(0.5, 0);
    this.nameText.position.set(0, -16);

    this.statusText = new Text({
      text: def.idle,
      style: new TextStyle({
        fontFamily: 'Inter, sans-serif',
        fontSize: 9.5,
        fontWeight: '500',
        fill: 0xfde68a
      })
    });
    this.statusText.anchor.set(0.5, 0);
    this.statusText.position.set(0, 0);

    this.badgeContainer.addChild(this.badgeBg);
    this.badgeContainer.addChild(this.nameText);
    this.badgeContainer.addChild(this.statusText);
    this.billboard.addChild(this.badgeContainer);

    // 5. Speech Bubble
    this.bubbleContainer = new Container();
    this.bubbleContainer.position.set(0, -112);
    this.bubbleContainer.visible = false;

    this.bubbleBg = new Graphics();
    this.bubbleText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        fontWeight: '500',
        fill: 0x0b1220,
        wordWrap: true,
        wordWrapWidth: 140,
        align: 'center',
        lineHeight: 14
      })
    });
    this.bubbleText.anchor.set(0.5, 0.5);

    this.bubbleContainer.addChild(this.bubbleBg);
    this.bubbleContainer.addChild(this.bubbleText);
    this.billboard.addChild(this.bubbleContainer);

    this.updateBadge(def.idle);
  }

  public updatePosition(worldX: number, worldY: number) {
    const pt = worldToScreen(worldX, worldY, 0);
    this.container.position.set(pt.x, pt.y);
    this.container.zIndex = getDepth(worldX, worldY, 0);
  }

  public updateBadge(status: string) {
    const maxLen = 22;
    const shortStatus = status.length > maxLen ? status.slice(0, maxLen - 1) + '…' : status;
    this.statusText.text = shortStatus;

    const padX = 8;
    const padY = 3;
    const w = Math.max(this.nameText.width, this.statusText.width) + padX * 2;
    const h = 32;

    this.badgeBg.clear();
    this.badgeBg.roundRect(-w / 2, -18, w, h, 8);
    this.badgeBg.fill({ color: 0x0b1220, alpha: 0.9 });
    this.badgeBg.stroke({ color: defShirtColor(this.def.shirt), width: 2 });
  }

  public showBubble(text: string) {
    this.currentText = text;
    this.bubbleText.text = text;

    const padX = 10;
    const padY = 6;
    const w = this.bubbleText.width + padX * 2;
    const h = this.bubbleText.height + padY * 2;

    this.bubbleBg.clear();
    // Rounded bubble
    this.bubbleBg.roundRect(-w / 2, -h / 2, w, h, 10);
    this.bubbleBg.fill({ color: 0xffffff });
    // Triangle tail
    this.bubbleBg.poly([
      -5, h / 2,
      5, h / 2,
      0, h / 2 + 6
    ]);
    this.bubbleBg.fill({ color: 0xffffff });

    this.bubbleContainer.visible = true;
    this.bubbleContainer.scale.set(0.8);
  }

  public hideBubble() {
    this.bubbleContainer.visible = false;
    this.currentText = '';
  }

  public setAct(act: ActivityType, isMoving: boolean) {
    this.currentAct = act;
    this.isMoving = isMoving;
  }

  public setSelected(sel: boolean) {
    this.isSelected = sel;
    this.ringSprite.visible = sel;
  }

  public update(deltaTime: number) {
    this.animTimer += deltaTime;
    const t = this.animTimer;

    // Reset standard transforms
    this.bodyContainer.position.set(0, 0);
    this.bodyContainer.rotation = 0;
    this.legLSprite.visible = true;
    this.legRSprite.visible = true;
    this.legLSprite.scale.set(1, 1);
    this.legRSprite.scale.set(1, 1);
    this.legLSprite.rotation = 0;
    this.legRSprite.rotation = 0;
    this.armLSprite.rotation = 0;
    this.armRSprite.rotation = 0;
    this.cupSprite.visible = false;
    this.cueSprite.visible = false;
    this.zzzSprite.visible = false;
    this.rippleSprite.visible = false;

    // Pop animation for bubble
    if (this.bubbleContainer.visible && this.bubbleContainer.scale.x < 1) {
      const nextScale = Math.min(1, this.bubbleContainer.scale.x + deltaTime * 4);
      this.bubbleContainer.scale.set(nextScale);
    }

    if (this.isMoving) {
      // Walking animation
      const walkT = t * 9;
      this.bodyContainer.y = -Math.abs(Math.sin(walkT)) * 4;
      this.legLSprite.rotation = Math.sin(walkT) * 0.42;
      this.legRSprite.rotation = -Math.sin(walkT) * 0.42;
      this.armLSprite.rotation = -Math.sin(walkT) * 0.42;
      this.armRSprite.rotation = Math.sin(walkT) * 0.42;
      return;
    }

    switch (this.currentAct) {
      case 'work': {
        // Typing animation
        this.bodyContainer.y = 5;
        this.legLSprite.scale.y = 0.55;
        this.legRSprite.scale.y = 0.55;
        this.armLSprite.rotation = -0.35 + Math.sin(t * 14) * 0.18;
        this.armRSprite.rotation = 0.35 - Math.sin(t * 14) * 0.18;
        break;
      }
      case 'meet': {
        // Meeting gesture
        this.bodyContainer.y = 5;
        this.legLSprite.scale.y = 0.55;
        this.legRSprite.scale.y = 0.55;
        this.armRSprite.rotation = -0.4 - Math.abs(Math.sin(t * 3)) * 0.8;
        this.armLSprite.rotation = 0.1;
        break;
      }
      case 'bil': {
        // Billiard pose
        this.bodyContainer.rotation = (7 * Math.PI) / 180;
        this.cueSprite.visible = true;
        this.armRSprite.rotation = Math.sin(t * 4) * 0.18;
        break;
      }
      case 'coffee': {
        // Sipping coffee
        this.cupSprite.visible = true;
        const cycle = t % 4;
        if (cycle > 2.0 && cycle < 3.2) {
          this.armRSprite.rotation = 1.3;
        } else {
          this.armRSprite.rotation = 0.2;
        }
        break;
      }
      case 'sit': {
        // Sitting rest
        this.bodyContainer.y = 10;
        this.legLSprite.scale.y = 0.5;
        this.legRSprite.scale.y = 0.5;
        break;
      }
      case 'lie': {
        // Lying down + floating Zzz
        this.bodyContainer.rotation = (-84 * Math.PI) / 180;
        this.bodyContainer.position.set(12, 2);
        this.zzzSprite.visible = true;
        const zCycle = (t * 1.5) % 2;
        this.zzzSprite.y = -70 - zCycle * 14;
        this.zzzSprite.alpha = 1 - zCycle / 2;
        break;
      }
      case 'pool': {
        // Swimming
        this.legLSprite.visible = false;
        this.legRSprite.visible = false;
        this.rippleSprite.visible = true;
        this.bodyContainer.y = 3 + Math.sin(t * 3) * 2;
        this.bodyContainer.rotation = Math.sin(t * 2) * 0.08;
        this.armLSprite.rotation = t * 6;
        this.armRSprite.rotation = t * 6 + Math.PI;

        const ripScale = 0.6 + ((t * 0.8) % 1) * 0.8;
        this.rippleSprite.scale.set(ripScale);
        this.rippleSprite.alpha = 1 - ((t * 0.8) % 1);
        break;
      }
    }
  }
}

function defShirtColor(hexStr: string): number {
  return parseInt(hexStr.replace('#', ''), 16);
}
