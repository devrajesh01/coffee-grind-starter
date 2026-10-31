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
export function createCoffeeBeanMesh(color = 0x4a2818): THREE.Group {
  const bean = new THREE.Group();
  
  // Outer bean body (flattened oval ellipsoid)
  const bodyGeo = new THREE.SphereGeometry(0.16, 24, 18);
  bodyGeo.scale(0.85, 1.25, 0.58);
  const beanMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.42,
    metalness: 0.08,
  });
  const body = new THREE.Mesh(bodyGeo, beanMat);
  bean.add(body);

  // Center seam curve
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.02, -0.16, 0.08),
    new THREE.Vector3(0.02, -0.05, 0.095),
    new THREE.Vector3(-0.015, 0.06, 0.095),
    new THREE.Vector3(0.018, 0.16, 0.08),
  ]);
  const seamGeo = new THREE.TubeGeometry(curve, 16, 0.012, 6, false);
  const seamMat = new THREE.MeshStandardMaterial({
    color: 0x1e0f08,
    roughness: 0.9,
  });
  const seam = new THREE.Mesh(seamGeo, seamMat);
  bean.add(seam);

  return bean;
}

/**
 * Creates the Precision Coffee Grinder with exploded shells and conical burr
 */
export function createGrinderModel() {
  const group = new THREE.Group();
  const brushedMetalTex = createBrushedMetalTexture();

  // Materials
  const satinSteel = new THREE.MeshStandardMaterial({
    color: 0xdedfdc,
    metalness: 0.88,
    roughness: 0.22,
    map: brushedMetalTex,
  });

  const darkGunmetal = new THREE.MeshStandardMaterial({
    color: 0x222627,
    metalness: 0.78,
    roughness: 0.32,
  });

  const blackAnodized = new THREE.MeshStandardMaterial({
    color: 0x141617,
    metalness: 0.4,
    roughness: 0.48,
  });

  const burrSteel = new THREE.MeshStandardMaterial({
    color: 0x8a9294,
    metalness: 0.95,
    roughness: 0.18,
  });

  // 1. TOP HOPPER ASSEMBLY
  const hopperGroup = new THREE.Group();
  // Conical hopper funnel
  const funnelGeo = new THREE.CylinderGeometry(0.88, 0.36, 0.98, 48, 1, true);
  const funnel = new THREE.Mesh(funnelGeo, satinSteel);
  funnel.position.y = 1.25;
  hopperGroup.add(funnel);

  // Hopper top lip
  const lipGeo = new THREE.TorusGeometry(0.87, 0.045, 16, 48);
  const lip = new THREE.Mesh(lipGeo, darkGunmetal);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = 1.74;
  hopperGroup.add(lip);

  // Hopper lid
  const lidGeo = new THREE.CylinderGeometry(0.83, 0.83, 0.08, 48);
  const lid = new THREE.Mesh(lidGeo, blackAnodized);
  lid.position.y = 1.78;
  hopperGroup.add(lid);

  // Lid handle knob
  const knobGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.12, 24);
  const knob = new THREE.Mesh(knobGeo, satinSteel);
  knob.position.y = 1.88;
  hopperGroup.add(knob);

  // Hopper throat mount
  const throatGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.35, 40);
  const throat = new THREE.Mesh(throatGeo, darkGunmetal);
  throat.position.y = 0.78;
  hopperGroup.add(throat);

  group.add(hopperGroup);

  // 2. EXPLODABLE OUTER CASING (LEFT & RIGHT HALF-SHELLS)
  // Left half cylinder shell
  const shellGeoLeft = new THREE.CylinderGeometry(0.68, 0.74, 1.88, 48, 1, false, -Math.PI / 2, Math.PI);
  const leftShell = new THREE.Mesh(shellGeoLeft, satinSteel);
  leftShell.position.set(0, -0.32, 0);
  group.add(leftShell);

  // Right half cylinder shell
  const shellGeoRight = new THREE.CylinderGeometry(0.68, 0.74, 1.88, 48, 1, false, Math.PI / 2, Math.PI);
  const rightShell = new THREE.Mesh(shellGeoRight, satinSteel);
  rightShell.position.set(0, -0.32, 0);
  group.add(rightShell);

  // 3. INTERNAL BURR CORE & CUTTING MECHANISM
  const internalGroup = new THREE.Group();

  // Central driveshaft
  const shaftGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.6, 24);
  const shaft = new THREE.Mesh(shaftGeo, burrSteel);
  shaft.position.y = -0.15;
  internalGroup.add(shaft);

  // Conical burr core
  const burrCore = new THREE.Group();
  const coneGeo = new THREE.CylinderGeometry(0.14, 0.44, 0.72, 32);
  const cone = new THREE.Mesh(coneGeo, burrSteel);
  cone.position.y = 0;
  burrCore.add(cone);

  // 7 Helical cutting flutes around the cone
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const fluteCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * 0.15, 0.34, Math.sin(angle) * 0.15),
      new THREE.Vector3(Math.cos(angle + 0.3) * 0.28, 0.05, Math.sin(angle + 0.3) * 0.28),
      new THREE.Vector3(Math.cos(angle + 0.65) * 0.45, -0.34, Math.sin(angle + 0.65) * 0.45),
    ]);
    const fluteGeo = new THREE.TubeGeometry(fluteCurve, 14, 0.038, 5, false);
    const fluteMesh = new THREE.Mesh(fluteGeo, burrSteel);
    burrCore.add(fluteMesh);
  }
  burrCore.position.y = -0.15;
  internalGroup.add(burrCore);

  // Outer burr teeth carrier ring
  const burrRingGeo = new THREE.CylinderGeometry(0.56, 0.52, 0.45, 40, 1, true);
  const burrRing = new THREE.Mesh(burrRingGeo, darkGunmetal);
  burrRing.position.y = -0.12;
  internalGroup.add(burrRing);

  // Stepped adjustment collar
  const collarGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.25, 48);
  const collar = new THREE.Mesh(collarGeo, blackAnodized);
  collar.position.y = 0.32;
  internalGroup.add(collar);

  group.add(internalGroup);

  // 4. LOWER CATCH CUP (GROUNDS RECEPTACLE) & BASE
  const catchCupGroup = new THREE.Group();
  const catchGeo = new THREE.CylinderGeometry(0.64, 0.64, 0.85, 48);
  const catchCup = new THREE.Mesh(catchGeo, darkGunmetal);
  catchCup.position.y = -1.18;
  catchCupGroup.add(catchCup);

  // Base plate
  const baseGeo = new THREE.CylinderGeometry(0.78, 0.82, 0.18, 48);
  const base = new THREE.Mesh(baseGeo, blackAnodized);
  base.position.y = -1.65;
  catchCupGroup.add(base);

  // Spout opening
  const spoutGeo = new THREE.BoxGeometry(0.32, 0.18, 0.22);
  const spout = new THREE.Mesh(spoutGeo, darkGunmetal);
  spout.position.set(0, -0.72, 0.62);
  catchCupGroup.add(spout);

  group.add(catchCupGroup);

  // 5. SIDE ADJUSTMENT DIAL & POWER BUTTON
  const dialGroup = new THREE.Group();
  const dialRingGeo = new THREE.TorusGeometry(0.24, 0.05, 12, 36);
  const dialRing = new THREE.Mesh(dialRingGeo, darkGunmetal);
  dialRing.position.set(0.68, -0.22, 0);
  dialRing.rotation.y = Math.PI / 2;
  dialGroup.add(dialRing);

  const dialKnobGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 32);
  const dialKnob = new THREE.Mesh(dialKnobGeo, satinSteel);
  dialKnob.rotation.z = Math.PI / 2;
  dialKnob.position.set(0.72, -0.22, 0);
  dialGroup.add(dialKnob);

  group.add(dialGroup);

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

  // 20 whole beans positioned above the hopper
  for (let i = 0; i < 20; i++) {
    const bean = createCoffeeBeanMesh(i % 2 === 0 ? 0x472616 : 0x3d1f10);
    const radius = 0.18 + (i % 4) * 0.12;
    const angle = i * 1.37;
    bean.position.set(
      Math.cos(angle) * radius,
      2.4 + (i * 0.22),
      Math.sin(angle) * radius
    );
    bean.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    bean.scale.setScalar(0.75 + (i % 3) * 0.15);
    beansGroup.add(bean);
    beans.push(bean);
  }

  // Shower of 400 fine coffee grounds particles
  const count = 400;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.35;
    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = -0.3 - Math.random() * 2.5; // below burr
    positions[i * 3 + 2] = Math.sin(angle) * r;

    // Rich dark brown hues
    const tint = 0.12 + Math.random() * 0.15;
    colors[i * 3] = tint * 1.4;
    colors[i * 3 + 1] = tint * 0.8;
    colors[i * 3 + 2] = tint * 0.45;
  }

  const groundsGeo = new THREE.BufferGeometry();
  groundsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  groundsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const groundsMat = new THREE.PointsMaterial({
    size: 0.055,
    vertexColors: true,
    transparent: true,
    opacity: 0,
  });

  const groundsParticles = new THREE.Points(groundsGeo, groundsMat);
  groundsParticles.position.set(0, 0, 0);

  return { beansGroup, beans, groundsParticles };
}

/**
 * Creates the Complete Pour-Over Ritual Scene (Kettle, V60 Dripper, Paper Filter, Carafe, Water & Coffee Streams)
 */
export function createPourModel() {
  const group = new THREE.Group();
  const brushedMetalTex = createBrushedMetalTexture();

  // Materials
  const stainlessSteel = new THREE.MeshStandardMaterial({
    color: 0xe6e8e5,
    metalness: 0.92,
    roughness: 0.16,
    map: brushedMetalTex,
  });

  const matteHandle = new THREE.MeshStandardMaterial({
    color: 0x1d1e1c,
    metalness: 0.25,
    roughness: 0.6,
  });

  // Optical clear glass material with transmission for dripper and carafe
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.04,
    transmission: 0.94,
    ior: 1.52,
    thickness: 0.22,
    transparent: true,
    opacity: 0.85,
  });

  const filterPaper = new THREE.MeshStandardMaterial({
    color: 0xede4d5,
    roughness: 0.88,
  });

  const coffeeBloomMat = new THREE.MeshStandardMaterial({
    color: 0x351b0f,
    roughness: 0.72,
  });

  const amberLiquidMat = new THREE.MeshStandardMaterial({
    color: 0x7a3a14,
    roughness: 0.12,
    metalness: 0.05,
    transparent: true,
    opacity: 0.88,
  });

  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0xf4f9fc,
    transmission: 0.92,
    roughness: 0.05,
    transparent: true,
    opacity: 0.78,
  });

  // 1. GOOSENECK KETTLE
  const kettle = new THREE.Group();

  // Bell-shaped ribbed body (profile curve lathe)
  const kettlePoints = [
    new THREE.Vector2(0.18, -0.65),
    new THREE.Vector2(0.68, -0.65),
    new THREE.Vector2(0.72, -0.42),
    new THREE.Vector2(0.66, -0.25),
    new THREE.Vector2(0.69, -0.08),
    new THREE.Vector2(0.61, 0.12),
    new THREE.Vector2(0.64, 0.28),
    new THREE.Vector2(0.48, 0.48),
    new THREE.Vector2(0.38, 0.54),
  ];
  const kettleBody = new THREE.Mesh(new THREE.LatheGeometry(kettlePoints, 48), stainlessSteel);
  kettle.add(kettleBody);

  // Kettle lid
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.1, 40), stainlessSteel);
  lid.position.y = 0.58;
  kettle.add(lid);

  const lidKnob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 16), matteHandle);
  lidKnob.position.y = 0.68;
  kettle.add(lidKnob);

  // Slender S-curve gooseneck spout
  const spoutCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.58, -0.45, 0),
    new THREE.Vector3(0.92, -0.32, 0),
    new THREE.Vector3(1.22, 0.05, 0),
    new THREE.Vector3(1.18, 0.52, 0),
    new THREE.Vector3(0.95, 0.68, 0),
    new THREE.Vector3(0.72, 0.62, 0),
  ]);
  const spoutGeo = new THREE.TubeGeometry(spoutCurve, 36, 0.055, 12, false);
  const spoutMesh = new THREE.Mesh(spoutGeo, stainlessSteel);
  kettle.add(spoutMesh);

  // Angled counterweight handle
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.52, 0.32, 0),
    new THREE.Vector3(-0.95, 0.42, 0),
    new THREE.Vector3(-1.12, 0.12, 0),
    new THREE.Vector3(-0.92, -0.35, 0),
    new THREE.Vector3(-0.62, -0.48, 0),
  ]);
  const handleGeo = new THREE.TubeGeometry(handleCurve, 24, 0.065, 12, false);
  const handleMesh = new THREE.Mesh(handleGeo, matteHandle);
  kettle.add(handleMesh);

  kettle.position.set(1.95, 0.85, 0.1);
  group.add(kettle);

  // 2. WATER STREAM FROM KETTLE SPOUT INTO DRIPPER
  const waterStreamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.67, 1.47, 0.1),
    new THREE.Vector3(2.35, 1.42, 0.1),
    new THREE.Vector3(1.82, 1.15, 0.1),
    new THREE.Vector3(1.05, 0.72, 0.1),
    new THREE.Vector3(0.0, 0.42, 0.0),
  ]);
  const waterStreamGeo = new THREE.TubeGeometry(waterStreamCurve, 32, 0.028, 10, false);
  const waterStream = new THREE.Mesh(waterStreamGeo, waterMat);
  waterStream.scale.set(0.001, 0.001, 0.001);
  group.add(waterStream);

  // 3. V60 CONE DRIPPER & PAPER FILTER
  const dripperGroup = new THREE.Group();

  // Glass conical dripper body
  const dripperConeGeo = new THREE.CylinderGeometry(0.74, 0.22, 0.82, 48, 1, true);
  const dripperCone = new THREE.Mesh(dripperConeGeo, glassMaterial);
  dripperCone.position.y = 0.52;
  dripperGroup.add(dripperCone);

  // Top rim ring
  const dripperRim = new THREE.Mesh(new THREE.TorusGeometry(0.73, 0.045, 14, 48), glassMaterial);
  dripperRim.rotation.x = Math.PI / 2;
  dripperRim.position.y = 0.93;
  dripperGroup.add(dripperRim);

  // Base collar
  const dripperBase = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.09, 36), glassMaterial);
  dripperBase.position.y = 0.08;
  dripperGroup.add(dripperBase);

  // Paper filter inside dripper
  const filterGeo = new THREE.CylinderGeometry(0.71, 0.20, 0.78, 48, 1, true);
  const filterMesh = new THREE.Mesh(filterGeo, filterPaper);
  filterMesh.position.y = 0.54;
  dripperGroup.add(filterMesh);

  // Coffee bloom bed inside filter
  const bloomGeo = new THREE.CylinderGeometry(0.48, 0.24, 0.28, 40);
  const bloomMesh = new THREE.Mesh(bloomGeo, coffeeBloomMat);
  bloomMesh.position.y = 0.32;
  dripperGroup.add(bloomMesh);

  dripperGroup.position.set(0, 0.12, 0);
  group.add(dripperGroup);

  // 4. GLASS CARAFE (SERVER) UNDER DRIPPER
  const carafeGroup = new THREE.Group();

  const carafePoints = [
    new THREE.Vector2(0.25, -1.05),
    new THREE.Vector2(0.68, -1.02),
    new THREE.Vector2(0.72, -0.62),
    new THREE.Vector2(0.62, -0.12),
    new THREE.Vector2(0.34, 0.02),
    new THREE.Vector2(0.28, 0.18),
    new THREE.Vector2(0.44, 0.24),
  ];
  const carafeMesh = new THREE.Mesh(new THREE.LatheGeometry(carafePoints, 48), glassMaterial);
  carafeGroup.add(carafeMesh);

  // Carafe handle
  const carafeHandleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.38, 0.12, 0),
    new THREE.Vector3(0.78, 0.02, 0),
    new THREE.Vector3(0.85, -0.45, 0),
    new THREE.Vector3(0.68, -0.72, 0),
  ]);
  const carafeHandle = new THREE.Mesh(new THREE.TubeGeometry(carafeHandleCurve, 20, 0.05, 10, false), glassMaterial);
  carafeGroup.add(carafeHandle);

  // Translucent brewed coffee liquid inside carafe
  const liquidFillGeo = new THREE.CylinderGeometry(0.55, 0.64, 0.62, 48);
  const liquidFill = new THREE.Mesh(liquidFillGeo, amberLiquidMat);
  liquidFill.position.y = -0.72;
  liquidFill.scale.set(1, 0.15, 1); // starts low, rises as coffee pours
  carafeGroup.add(liquidFill);

  carafeGroup.position.set(0, -0.15, 0);
  group.add(carafeGroup);

  // 5. AMBER DRIP THREAD FROM DRIPPER INTO CARAFE
  const dripGeo = new THREE.CylinderGeometry(0.022, 0.038, 0.72, 16);
  const coffeeDrip = new THREE.Mesh(dripGeo, amberLiquidMat);
  coffeeDrip.position.set(0, -0.22, 0);
  coffeeDrip.scale.y = 0.001;
  group.add(coffeeDrip);

  // 6. RISING STEAM PARTICLES
  const steamSprite = createSteamSprite();
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
      0.65 + Math.random() * 0.9,
      (Math.random() - 0.5) * 0.45
    );
    const s = 0.35 + Math.random() * 0.35;
    sprite.scale.set(s, s, 1);
    steamGroup.add(sprite);
    steamParticles.push(sprite);
  }
  group.add(steamGroup);

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
 * Creates the Handcrafted Artisan Ceramic Coffee Mug with Ripple Base
 */
export function createCupModel(cupColor = 0xa95d3d, lipColor = 0xd6b99d) {
  const group = new THREE.Group();
  const clayTex = createCeramicTexture('#b86b4b');
  const rippleTex = createRippleTexture();

  // Ceramic base clay material (matte stoneware)
  const clayMat = new THREE.MeshStandardMaterial({
    color: cupColor,
    roughness: 0.58,
    metalness: 0.04,
    map: clayTex,
  });

  // Reactive lip glaze material (silky gloss)
  const glazeMat = new THREE.MeshStandardMaterial({
    color: lipColor,
    roughness: 0.24,
    metalness: 0.08,
  });

  // Dark rich coffee liquid surface
  const liquidMat = new THREE.MeshStandardMaterial({
    color: 0x22110a,
    roughness: 0.12,
    metalness: 0.15,
    normalMap: rippleTex,
    normalScale: new THREE.Vector2(0.4, 0.4),
  });

  // 1. MUG BODY (Pottery profile with smooth belly curve)
  const mugPoints = [
    new THREE.Vector2(0.01, -0.78),
    new THREE.Vector2(0.58, -0.76),
    new THREE.Vector2(0.74, -0.52),
    new THREE.Vector2(0.79, -0.15),
    new THREE.Vector2(0.76, 0.25),
    new THREE.Vector2(0.72, 0.48),
  ];
  const mugBody = new THREE.Mesh(new THREE.LatheGeometry(mugPoints, 48), clayMat);
  group.add(mugBody);

  // Upper glazed rim dip (two-tone artisan pottery)
  const rimPoints = [
    new THREE.Vector2(0.71, 0.28),
    new THREE.Vector2(0.74, 0.49),
    new THREE.Vector2(0.70, 0.52),
    new THREE.Vector2(0.66, 0.48),
    new THREE.Vector2(0.65, 0.28),
  ];
  const rimMesh = new THREE.Mesh(new THREE.LatheGeometry(rimPoints, 48), glazeMat);
  group.add(rimMesh);

  // Sturdy hand-pulled ceramic loop handle
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.72, 0.32, 0),
    new THREE.Vector3(1.15, 0.22, 0),
    new THREE.Vector3(1.18, -0.32, 0),
    new THREE.Vector3(0.76, -0.46, 0),
  ]);
  const handleGeo = new THREE.TubeGeometry(handleCurve, 28, 0.09, 12, false);
  const handleMesh = new THREE.Mesh(handleGeo, clayMat);
  group.add(handleMesh);

  // Liquid coffee top surface
  const liquidGeo = new THREE.CircleGeometry(0.66, 48);
  const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  liquidMesh.rotation.x = -Math.PI / 2;
  liquidMesh.position.y = 0.42;
  group.add(liquidMesh);

  // 2. EXPANDING LIQUID RIPPLE POOL BENEATH CUP
  const ripplePlaneGeo = new THREE.RingGeometry(0.8, 2.6, 48);
  const ripplePlaneMat = new THREE.MeshStandardMaterial({
    color: 0x2e170d,
    roughness: 0.25,
    metalness: 0.1,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const ripplePlane = new THREE.Mesh(ripplePlaneGeo, ripplePlaneMat);
  ripplePlane.rotation.x = -Math.PI / 2;
  ripplePlane.position.y = -0.77;
  group.add(ripplePlane);

  setShadows(group);

  return {
    group,
    mugBody,
    rimMesh,
    handleMesh,
    liquidMesh,
    ripplePlane,
    clayMat,
    glazeMat,
  };
}

