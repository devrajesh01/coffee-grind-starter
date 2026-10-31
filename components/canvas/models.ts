import * as THREE from 'three';
import {
  createBrushedMetalTexture,
  createCeramicTexture,
  createRippleTexture,
  createSteamSprite
} from './proceduralTextures';

export function setShadows(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

/**
 * Creates a single realistic 3D coffee bean
 */
export function createCoffeeBeanMesh(color = 0x422212): THREE.Group {
  const bean = new THREE.Group();
  
  // Outer bean body (flattened oval ellipsoid)
  const bodyGeo = new THREE.SphereGeometry(0.18, 24, 18);
  bodyGeo.scale(0.82, 1.25, 0.55);
  const beanMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.38,
    metalness: 0.05,
  });
  const body = new THREE.Mesh(bodyGeo, beanMat);
  bean.add(body);

  // Center seam curve
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.02, -0.18, 0.09),
    new THREE.Vector3(0.025, -0.06, 0.105),
    new THREE.Vector3(-0.02, 0.06, 0.105),
    new THREE.Vector3(0.02, 0.18, 0.09),
  ]);
  const seamGeo = new THREE.TubeGeometry(curve, 16, 0.014, 6, false);
  const seamMat = new THREE.MeshStandardMaterial({
    color: 0x180b06,
    roughness: 0.92,
  });
  const seam = new THREE.Mesh(seamGeo, seamMat);
  bean.add(seam);

  return bean;
}

/**
 * Creates the Precision Coffee Grinder matching the video's aesthetic
 */
export function createGrinderModel() {
  const group = new THREE.Group();
  const brushedMetalTex = createBrushedMetalTexture(256, 256);

  // High-end satin silver aluminum material
  const satinAluminum = new THREE.MeshStandardMaterial({
    color: 0xf5f5f4,
    metalness: 0.82,
    roughness: 0.22,
    map: brushedMetalTex,
  });

  const polishedChrome = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.95,
    roughness: 0.12,
  });

  const darkGunmetal = new THREE.MeshStandardMaterial({
    color: 0x2c2f30,
    metalness: 0.75,
    roughness: 0.28,
  });

  const blackAnodized = new THREE.MeshStandardMaterial({
    color: 0x181a1b,
    metalness: 0.35,
    roughness: 0.45,
  });

  const burrSteel = new THREE.MeshStandardMaterial({
    color: 0xd8dedf,
    metalness: 0.92,
    roughness: 0.15,
  });

  // 1. TOP HOPPER ASSEMBLY
  const hopperGroup = new THREE.Group();
  
  // Conical hopper funnel (wide open top, smooth taper)
  const funnelGeo = new THREE.CylinderGeometry(1.02, 0.44, 1.05, 48, 1, true);
  const funnel = new THREE.Mesh(funnelGeo, satinAluminum);
  funnel.position.y = 1.25;
  funnel.material.side = THREE.DoubleSide;
  hopperGroup.add(funnel);

  // Hopper top rolled chrome lip
  const lipGeo = new THREE.TorusGeometry(1.01, 0.045, 16, 48);
  const lip = new THREE.Mesh(lipGeo, polishedChrome);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = 1.77;
  hopperGroup.add(lip);

  // Hopper throat collar
  const throatGeo = new THREE.CylinderGeometry(0.46, 0.50, 0.38, 48);
  const throat = new THREE.Mesh(throatGeo, darkGunmetal);
  throat.position.y = 0.72;
  hopperGroup.add(throat);

  group.add(hopperGroup);

  // 2. EXPLODABLE OUTER CASING (LEFT & RIGHT HALF-SHELLS)
  // Left half cylinder shell
  const shellGeoLeft = new THREE.CylinderGeometry(0.76, 0.82, 1.95, 48, 1, false, -Math.PI / 2, Math.PI);
  const leftShell = new THREE.Mesh(shellGeoLeft, satinAluminum);
  leftShell.position.set(0, -0.38, 0);
  group.add(leftShell);

  // Right half cylinder shell
  const shellGeoRight = new THREE.CylinderGeometry(0.76, 0.82, 1.95, 48, 1, false, Math.PI / 2, Math.PI);
  const rightShell = new THREE.Mesh(shellGeoRight, satinAluminum);
  rightShell.position.set(0, -0.38, 0);
  group.add(rightShell);

  // 3. INTERNAL BURR CORE & CUTTING MECHANISM
  const internalGroup = new THREE.Group();

  // Central motor axle
  const shaftGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.7, 24);
  const shaft = new THREE.Mesh(shaftGeo, polishedChrome);
  shaft.position.y = -0.22;
  internalGroup.add(shaft);

  // Conical burr core
  const burrCore = new THREE.Group();
  const coneGeo = new THREE.CylinderGeometry(0.18, 0.48, 0.82, 32);
  const cone = new THREE.Mesh(coneGeo, burrSteel);
  burrCore.add(cone);

  // 7 Helical cutting flutes around the cone
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const fluteCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * 0.18, 0.38, Math.sin(angle) * 0.18),
      new THREE.Vector3(Math.cos(angle + 0.32) * 0.32, 0.06, Math.sin(angle + 0.32) * 0.32),
      new THREE.Vector3(Math.cos(angle + 0.72) * 0.49, -0.38, Math.sin(angle + 0.72) * 0.49),
    ]);
    const fluteGeo = new THREE.TubeGeometry(fluteCurve, 14, 0.042, 6, false);
    const fluteMesh = new THREE.Mesh(fluteGeo, burrSteel);
    burrCore.add(fluteMesh);
  }
  burrCore.position.y = -0.22;
  internalGroup.add(burrCore);

  // Outer burr teeth carrier ring
  const burrRingGeo = new THREE.CylinderGeometry(0.65, 0.60, 0.52, 48, 1, true);
  const burrRing = new THREE.Mesh(burrRingGeo, darkGunmetal);
  burrRing.position.y = -0.18;
  burrRing.material.side = THREE.DoubleSide;
  internalGroup.add(burrRing);

  // Stepped adjustment collar with knurled ring
  const collarGeo = new THREE.CylinderGeometry(0.66, 0.66, 0.28, 48);
  const collar = new THREE.Mesh(collarGeo, blackAnodized);
  collar.position.y = 0.32;
  internalGroup.add(collar);

  group.add(internalGroup);

  // 4. LOWER CATCH CUP (GROUNDS RECEPTACLE) & WEIGHTED BASE
  const catchCupGroup = new THREE.Group();
  const catchGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.92, 48);
  const catchCup = new THREE.Mesh(catchGeo, darkGunmetal);
  catchCup.position.y = -1.25;
  catchCupGroup.add(catchCup);

  // Cast weighted platform base
  const baseGeo = new THREE.CylinderGeometry(0.88, 0.94, 0.22, 48);
  const base = new THREE.Mesh(baseGeo, blackAnodized);
  base.position.y = -1.78;
  catchCupGroup.add(base);

  // Ground spout nozzle
  const spoutGeo = new THREE.BoxGeometry(0.36, 0.22, 0.26);
  const spout = new THREE.Mesh(spoutGeo, darkGunmetal);
  spout.position.set(0, -0.76, 0.68);
  catchCupGroup.add(spout);

  group.add(catchCupGroup);

  // 5. SIDE STEP DIAL
  const dialGroup = new THREE.Group();
  const dialRingGeo = new THREE.TorusGeometry(0.26, 0.05, 12, 36);
  const dialRing = new THREE.Mesh(dialRingGeo, darkGunmetal);
  dialRing.position.set(0.78, -0.28, 0);
  dialRing.rotation.y = Math.PI / 2;
  dialGroup.add(dialRing);

  const dialKnobGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 32);
  const dialKnob = new THREE.Mesh(dialKnobGeo, polishedChrome);
  dialKnob.rotation.z = Math.PI / 2;
  dialKnob.position.set(0.82, -0.28, 0);
  dialGroup.add(dialKnob);

  group.add(dialGroup);

  // Subtle tilt for 3/4 perspective matching video
  group.position.set(0, 0.05, 0);
  group.rotation.x = 0.08;
  group.rotation.y = -0.12;

  setShadows(group);

  return {
    group,
    hopperGroup,
    leftShell,
    rightShell,
    internalGroup,
    burrCore,
    catchCupGroup,
    dialGroup,
  };
}

/**
 * Creates whole coffee beans and falling grounds particle shower
 */
export function createBeansAndGrounds() {
  const beansGroup = new THREE.Group();
  const beans: THREE.Group[] = [];

  // 18 whole beans clustering directly above the hopper mouth
  for (let i = 0; i < 18; i++) {
    const bean = createCoffeeBeanMesh(i % 2 === 0 ? 0x482414 : 0x381a0d);
    const radius = 0.12 + (i % 3) * 0.09;
    const angle = i * 1.5;
    bean.position.set(
      Math.cos(angle) * radius,
      2.1 + (i * 0.18),
      Math.sin(angle) * radius
    );
    bean.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    bean.scale.setScalar(0.78 + (i % 3) * 0.12);
    beansGroup.add(bean);
    beans.push(bean);
  }

  // Shower of fine coffee grounds particles
  const count = 450;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.32;
    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = -0.4 - Math.random() * 2.8;
    positions[i * 3 + 2] = Math.sin(angle) * r;

    const tint = 0.14 + Math.random() * 0.14;
    colors[i * 3] = tint * 1.5;
    colors[i * 3 + 1] = tint * 0.85;
    colors[i * 3 + 2] = tint * 0.45;
  }

  const groundsGeo = new THREE.BufferGeometry();
  groundsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  groundsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const groundsMat = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0,
  });

  const groundsParticles = new THREE.Points(groundsGeo, groundsMat);

  return { beansGroup, beans, groundsParticles };
}

/**
 * Creates the Complete Pour-Over Ritual Scene (Gooseneck Kettle, Glass V60, Carafe, Water & Coffee Streams, Background Ceramics)
 */
export function createPourModel() {
  const group = new THREE.Group();
  const brushedMetalTex = createBrushedMetalTexture(256, 256);

  // Materials
  const polishedSteel = new THREE.MeshStandardMaterial({
    color: 0xf2f4f2,
    metalness: 0.92,
    roughness: 0.16,
    map: brushedMetalTex,
  });

  const matteHandle = new THREE.MeshStandardMaterial({
    color: 0x1b1c1b,
    metalness: 0.2,
    roughness: 0.55,
  });

  // Optical clear glass material with transmission for dripper and carafe
  const opticalGlass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.04,
    transmission: 0.95,
    ior: 1.52,
    thickness: 0.3,
    transparent: true,
    opacity: 0.9,
  });

  const paperFilter = new THREE.MeshStandardMaterial({
    color: 0xf1ebe1,
    roughness: 0.85,
  });

  const coffeeBloomMat = new THREE.MeshStandardMaterial({
    color: 0x2e150a,
    roughness: 0.65,
  });

  const amberCoffeeLiquid = new THREE.MeshStandardMaterial({
    color: 0x6e310e,
    roughness: 0.12,
    metalness: 0.08,
    transparent: true,
    opacity: 0.88,
  });

  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0xf5fbff,
    transmission: 0.95,
    roughness: 0.04,
    transparent: true,
    opacity: 0.82,
  });

  const terracottaPropMat = new THREE.MeshStandardMaterial({
    color: 0xb96947,
    roughness: 0.6,
  });

  const creamPropMat = new THREE.MeshStandardMaterial({
    color: 0xe8e2d4,
    roughness: 0.45,
  });

  // 1. HARIO BUONO STYLE GOOSENECK KETTLE
  const kettle = new THREE.Group();

  // Wave-ribbed body profile (lathe curve with stepped waves)
  const kettlePoints = [
    new THREE.Vector2(0.2, -0.68),
    new THREE.Vector2(0.72, -0.68),
    new THREE.Vector2(0.76, -0.44),
    new THREE.Vector2(0.68, -0.26),
    new THREE.Vector2(0.73, -0.08),
    new THREE.Vector2(0.64, 0.12),
    new THREE.Vector2(0.68, 0.28),
    new THREE.Vector2(0.52, 0.48),
    new THREE.Vector2(0.38, 0.54),
  ];
  const kettleBody = new THREE.Mesh(new THREE.LatheGeometry(kettlePoints, 48), polishedSteel);
  kettle.add(kettleBody);

  // Kettle lid
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.40, 0.1, 40), polishedSteel);
  lid.position.y = 0.58;
  kettle.add(lid);

  const lidKnob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 16), matteHandle);
  lidKnob.position.y = 0.68;
  kettle.add(lidKnob);

  // Swan-neck / gooseneck spout curving upward and tapering down
  const spoutCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.62, -0.48, 0),
    new THREE.Vector3(0.98, -0.34, 0),
    new THREE.Vector3(1.28, 0.06, 0),
    new THREE.Vector3(1.24, 0.54, 0),
    new THREE.Vector3(0.98, 0.72, 0),
    new THREE.Vector3(0.72, 0.64, 0),
  ]);
  const spoutGeo = new THREE.TubeGeometry(spoutCurve, 36, 0.055, 12, false);
  const spoutMesh = new THREE.Mesh(spoutGeo, polishedSteel);
  kettle.add(spoutMesh);

  // Stay-cool angled handle
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.55, 0.35, 0),
    new THREE.Vector3(-1.0, 0.44, 0),
    new THREE.Vector3(-1.18, 0.14, 0),
    new THREE.Vector3(-0.96, -0.36, 0),
    new THREE.Vector3(-0.65, -0.49, 0),
  ]);
  const handleGeo = new THREE.TubeGeometry(handleCurve, 24, 0.07, 12, false);
  const handleMesh = new THREE.Mesh(handleGeo, matteHandle);
  kettle.add(handleMesh);

  kettle.position.set(2.0, 0.9, 0.1);
  group.add(kettle);

  // 2. WATER STREAM FROM KETTLE SPOUT INTO DRIPPER
  const waterStreamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.72, 1.54, 0.1),
    new THREE.Vector3(2.38, 1.48, 0.1),
    new THREE.Vector3(1.82, 1.18, 0.1),
    new THREE.Vector3(1.05, 0.74, 0.1),
    new THREE.Vector3(0.0, 0.44, 0.0),
  ]);
  const waterStreamGeo = new THREE.TubeGeometry(waterStreamCurve, 32, 0.03, 10, false);
  const waterStream = new THREE.Mesh(waterStreamGeo, waterMat);
  waterStream.scale.set(0.001, 0.001, 0.001);
  group.add(waterStream);

  // 3. V60 CONE DRIPPER & PAPER FILTER
  const dripperGroup = new THREE.Group();

  // Glass conical dripper
  const dripperConeGeo = new THREE.CylinderGeometry(0.78, 0.24, 0.86, 48, 1, true);
  const dripperCone = new THREE.Mesh(dripperConeGeo, opticalGlass);
  dripperCone.position.y = 0.54;
  dripperCone.material.side = THREE.DoubleSide;
  dripperGroup.add(dripperCone);

  // Glass top rim
  const dripperRim = new THREE.Mesh(new THREE.TorusGeometry(0.77, 0.045, 14, 48), opticalGlass);
  dripperRim.rotation.x = Math.PI / 2;
  dripperRim.position.y = 0.97;
  dripperGroup.add(dripperRim);

  // Glass base collar
  const dripperBase = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.40, 0.1, 36), opticalGlass);
  dripperBase.position.y = 0.08;
  dripperGroup.add(dripperBase);

  // Fluted paper filter inside cone
  const filterGeo = new THREE.CylinderGeometry(0.75, 0.22, 0.82, 48, 1, true);
  const filterMesh = new THREE.Mesh(filterGeo, paperFilter);
  filterMesh.position.y = 0.56;
  filterMesh.material.side = THREE.DoubleSide;
  dripperGroup.add(filterMesh);

  // Blooming coffee bed
  const bloomGeo = new THREE.CylinderGeometry(0.50, 0.26, 0.30, 40);
  const bloomMesh = new THREE.Mesh(bloomGeo, coffeeBloomMat);
  bloomMesh.position.y = 0.34;
  dripperGroup.add(bloomMesh);

  dripperGroup.position.set(0, 0.12, 0);
  group.add(dripperGroup);

  // 4. GLASS CARAFE (SERVER) UNDER DRIPPER
  const carafeGroup = new THREE.Group();

  const carafePoints = [
    new THREE.Vector2(0.26, -1.08),
    new THREE.Vector2(0.72, -1.04),
    new THREE.Vector2(0.76, -0.64),
    new THREE.Vector2(0.65, -0.12),
    new THREE.Vector2(0.36, 0.02),
    new THREE.Vector2(0.30, 0.18),
    new THREE.Vector2(0.46, 0.24),
  ];
  const carafeMesh = new THREE.Mesh(new THREE.LatheGeometry(carafePoints, 48), opticalGlass);
  carafeMesh.material.side = THREE.DoubleSide;
  carafeGroup.add(carafeMesh);

  // Carafe handle
  const carafeHandleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.40, 0.14, 0),
    new THREE.Vector3(0.82, 0.04, 0),
    new THREE.Vector3(0.90, -0.46, 0),
    new THREE.Vector3(0.72, -0.74, 0),
  ]);
  const carafeHandle = new THREE.Mesh(new THREE.TubeGeometry(carafeHandleCurve, 20, 0.055, 10, false), opticalGlass);
  carafeGroup.add(carafeHandle);

  // Translucent brewed coffee liquid inside carafe
  const liquidFillGeo = new THREE.CylinderGeometry(0.58, 0.68, 0.66, 48);
  const liquidFill = new THREE.Mesh(liquidFillGeo, amberCoffeeLiquid);
  liquidFill.position.y = -0.74;
  liquidFill.scale.set(1, 0.15, 1);
  carafeGroup.add(liquidFill);

  carafeGroup.position.set(0, -0.15, 0);
  group.add(carafeGroup);

  // 5. AMBER DRIP THREAD FROM DRIPPER INTO CARAFE
  const dripGeo = new THREE.CylinderGeometry(0.024, 0.040, 0.74, 16);
  const coffeeDrip = new THREE.Mesh(dripGeo, amberCoffeeLiquid);
  coffeeDrip.position.set(0, -0.24, 0);
  coffeeDrip.scale.y = 0.001;
  group.add(coffeeDrip);

  // 6. RISING STEAM PARTICLES
  const steamSprite = createSteamSprite(128);
  const steamCount = 35;
  const steamGroup = new THREE.Group();
  const steamParticles: THREE.Sprite[] = [];

  for (let i = 0; i < steamCount; i++) {
    const mat = new THREE.SpriteMaterial({
      map: steamSprite,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(
      (Math.random() - 0.5) * 0.45,
      0.68 + Math.random() * 0.9,
      (Math.random() - 0.5) * 0.45
    );
    const s = 0.35 + Math.random() * 0.35;
    sprite.scale.set(s, s, 1);
    steamGroup.add(sprite);
    steamParticles.push(sprite);
  }
  group.add(steamGroup);

  // 7. BACKGROUND AMBIENT TABLETOP CERAMICS (matching frame_05.0s.jpg & frame_07.0s.jpg)
  const bgPropsGroup = new THREE.Group();

  // Terracotta hourglass vase in back left
  const vasePoints = [
    new THREE.Vector2(0.1, -0.8),
    new THREE.Vector2(0.42, -0.8),
    new THREE.Vector2(0.24, -0.1),
    new THREE.Vector2(0.38, 0.6),
  ];
  const vaseMesh = new THREE.Mesh(new THREE.LatheGeometry(vasePoints, 32), terracottaPropMat);
  vaseMesh.position.set(-2.4, -0.2, -1.8);
  vaseMesh.scale.setScalar(0.9);
  bgPropsGroup.add(vaseMesh);

  // Cream ceramic tumbler in back right
  const tumblerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.8, 32), creamPropMat);
  tumblerMesh.position.set(2.2, -0.3, -1.9);
  bgPropsGroup.add(tumblerMesh);

  // Warm terracotta totem prop in far back right
  const totemMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.2, 32), terracottaPropMat);
  totemMesh.position.set(2.8, 0.2, -2.4);
  bgPropsGroup.add(totemMesh);

  group.add(bgPropsGroup);

  group.position.set(0, 0, 0);
  setShadows(group);

  return {
    group,
    kettle,
    waterStream,
    dripperGroup,
    bloomMesh,
    carafeGroup,
    liquidFill,
    coffeeDrip,
    steamParticles,
  };
}

/**
 * Creates the Handcrafted Artisan Ceramic Coffee Mug matching frame_09.0s.jpg
 */
export function createCupModel(cupColor = 0xb86b4b, lipColor = 0xf2e4d0) {
  const group = new THREE.Group();
  const clayTex = createCeramicTexture('#b86b4b', 256, 256);
  const rippleTex = createRippleTexture(128, 128);

  // Ceramic base clay material (warm wheel-thrown stoneware)
  const clayMat = new THREE.MeshStandardMaterial({
    color: cupColor,
    roughness: 0.55,
    metalness: 0.04,
    map: clayTex,
  });

  // Reactive lip glaze material (silky gloss cream/sand glaze)
  const glazeMat = new THREE.MeshStandardMaterial({
    color: lipColor,
    roughness: 0.22,
    metalness: 0.06,
  });

  // Dark rich coffee liquid surface with ripples
  const liquidMat = new THREE.MeshStandardMaterial({
    color: 0x1f0e07,
    roughness: 0.12,
    metalness: 0.12,
    normalMap: rippleTex,
    normalScale: new THREE.Vector2(0.35, 0.35),
  });

  // 1. MUG BODY (rounded belly ceramic stoneware profile)
  const mugPoints = [
    new THREE.Vector2(0.01, -0.75),
    new THREE.Vector2(0.62, -0.73),
    new THREE.Vector2(0.82, -0.48),
    new THREE.Vector2(0.86, -0.10),
    new THREE.Vector2(0.82, 0.30),
    new THREE.Vector2(0.78, 0.52),
  ];
  const mugBody = new THREE.Mesh(new THREE.LatheGeometry(mugPoints, 48), clayMat);
  group.add(mugBody);

  // Upper dipped reactive glazed rim
  const rimPoints = [
    new THREE.Vector2(0.77, 0.25),
    new THREE.Vector2(0.80, 0.52),
    new THREE.Vector2(0.76, 0.56),
    new THREE.Vector2(0.71, 0.52),
    new THREE.Vector2(0.70, 0.25),
  ];
  const rimMesh = new THREE.Mesh(new THREE.LatheGeometry(rimPoints, 48), glazeMat);
  group.add(rimMesh);

  // Sturdy hand-pulled ceramic loop handle on right
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.78, 0.36, 0),
    new THREE.Vector3(1.25, 0.25, 0),
    new THREE.Vector3(1.28, -0.32, 0),
    new THREE.Vector3(0.82, -0.46, 0),
  ]);
  const handleGeo = new THREE.TubeGeometry(handleCurve, 28, 0.095, 12, false);
  const handleMesh = new THREE.Mesh(handleGeo, clayMat);
  group.add(handleMesh);

  // Steaming dark coffee liquid surface
  const liquidGeo = new THREE.CircleGeometry(0.72, 48);
  const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  liquidMesh.rotation.x = -Math.PI / 2;
  liquidMesh.position.y = 0.44;
  group.add(liquidMesh);

  // Soft warm ambient contact shadow beneath cup
  const shadowGeo = new THREE.CircleGeometry(0.95, 32);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x422a1d,
    transparent: true,
    opacity: 0.16,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = -0.74;
  group.add(contactShadow);

  // 2. FLOATING ROASTED COFFEE BEANS (as seen in frame_09.4s.jpg to the right of the cup)
  const beanGroup = new THREE.Group();
  const beanMat = new THREE.MeshStandardMaterial({
    color: 0x3d2015,
    roughness: 0.38,
    metalness: 0.08,
  });

  const beanGeo = new THREE.SphereGeometry(0.12, 16, 14);
  beanGeo.scale(1.0, 1.45, 0.72);

  const beanPositions = [
    { pos: new THREE.Vector3(1.35, 0.88, 0.2), rot: [0.3, 0.4, 0.2] },
    { pos: new THREE.Vector3(1.68, 0.65, -0.1), rot: [-0.4, 0.8, 0.5] },
    { pos: new THREE.Vector3(1.22, 1.18, 0.3), rot: [0.6, -0.3, 0.4] },
  ];

  beanPositions.forEach(({ pos, rot }) => {
    const bMesh = new THREE.Mesh(beanGeo, beanMat);
    bMesh.position.copy(pos);
    bMesh.rotation.set(rot[0], rot[1], rot[2]);
    beanGroup.add(bMesh);
  });
  group.add(beanGroup);

  // 3. BACKGROUND AMBIENT SCULPTURAL ACCENTS (matching video backdrop)
  const bgAccents = new THREE.Group();
  const creamMat = new THREE.MeshStandardMaterial({
    color: 0xf5eee6,
    roughness: 0.35,
    metalness: 0.02,
  });
  const terracottaMat = new THREE.MeshStandardMaterial({
    color: 0xd9825b,
    roughness: 0.52,
    metalness: 0.04,
  });

  // Smooth torus arc in top right framing the corner
  const torusMesh = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.25, 20, 48), creamMat);
  torusMesh.position.set(3.2, 1.7, -2.5);
  torusMesh.rotation.set(0.6, 0.3, -0.4);
  bgAccents.add(torusMesh);

  // Smooth organic clay form in bottom left framing the corner
  const pebbleMesh = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 24), terracottaMat);
  pebbleMesh.scale.set(1.8, 1.2, 1.0);
  pebbleMesh.position.set(-3.4, -1.8, -2.2);
  bgAccents.add(pebbleMesh);

  group.add(bgAccents);

  group.rotation.x = 0.14;
  group.rotation.y = -0.15;

  setShadows(group);

  return {
    group,
    mugBody,
    rimMesh,
    handleMesh,
    liquidMesh,
    beanGroup,
    clayMat,
    glazeMat,
  };
}
