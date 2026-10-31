import * as THREE from 'three';

/**
 * Procedural brushed metal texture for grinder and kettle
 */
export function createBrushedMetalTexture(width = 512, height = 512): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#b8bbb9';
  ctx.fillRect(0, 0, width, height);

  // Add fine horizontal directional streaks
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    // Row noise factor
    const rowNoise = (Math.random() - 0.5) * 35;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const pixelNoise = (Math.random() - 0.5) * 18 + rowNoise;
      const base = 185 + pixelNoise;
      data[idx] = Math.min(255, Math.max(0, base));
      data[idx + 1] = Math.min(255, Math.max(0, base + 2));
      data[idx + 2] = Math.min(255, Math.max(0, base + 4));
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/**
 * Procedural ceramic stoneware texture with organic speckles
 */
export function createCeramicTexture(baseHex = '#B86B4B', width = 512, height = 512): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, width, height);

  // Subtle horizontal wheel thrown ridges
  for (let y = 0; y < height; y += 4) {
    const alpha = 0.04 + Math.sin(y * 0.1) * 0.03;
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, y, width, 2);
  }

  // Clay mineral specks (light and dark)
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 1.6 + 0.4;
    const isDark = Math.random() > 0.4;
    ctx.fillStyle = isDark ? 'rgba(35, 20, 15, 0.45)' : 'rgba(255, 245, 230, 0.35)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

/**
 * Procedural ripple normal map for liquid coffee surface
 */
export function createRippleTexture(width = 256, height = 256): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const cx = width / 2;
  const cy = height / 2;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Concentric damping sine waves
      const wave = Math.sin(dist * 0.28) * Math.exp(-dist * 0.025);
      
      const nx = (dx / (dist + 0.001)) * wave * 0.5;
      const ny = (dy / (dist + 0.001)) * wave * 0.5;
      
      // Normal vector mapped to RGB [0..255]
      const idx = (y * width + x) * 4;
      data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = 255;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Soft gaussian steam particle sprite
 */
export function createSteamSprite(size = 128): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(0.35, 'rgba(245, 240, 235, 0.45)');
  grad.addColorStop(0.7, 'rgba(235, 230, 225, 0.12)');
  grad.addColorStop(1, 'rgba(235, 230, 225, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

