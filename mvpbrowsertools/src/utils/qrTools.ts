interface QrBlockGroup {
  count: number;
  total: number;
  data: number;
}

const BLOCKS_L: Record<number, QrBlockGroup[]> = {
  1: [{ count: 1, total: 26, data: 19 }],
  2: [{ count: 1, total: 44, data: 34 }],
  3: [{ count: 1, total: 70, data: 55 }],
  4: [{ count: 1, total: 100, data: 80 }],
  5: [{ count: 1, total: 134, data: 108 }],
  6: [{ count: 2, total: 86, data: 68 }],
  7: [{ count: 2, total: 98, data: 78 }],
  8: [{ count: 2, total: 121, data: 97 }],
  9: [{ count: 2, total: 146, data: 116 }],
  10: [
    { count: 2, total: 86, data: 68 },
    { count: 2, total: 87, data: 69 },
  ],
};

const dataCodewordCount = (version: number) =>
  BLOCKS_L[version].reduce((total, group) => total + group.count * group.data, 0);

const byteCountBits = (version: number) => (version < 10 ? 8 : 16);

const maxByteLength = (version: number) =>
  Math.floor((dataCodewordCount(version) * 8 - 4 - byteCountBits(version) - 4) / 8);

const ALIGNMENT_POSITIONS: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
};

const gfExp = new Array<number>(512).fill(0);
const gfLog = new Array<number>(256).fill(0);
let x = 1;
for (let i = 0; i < 255; i += 1) {
  gfExp[i] = x;
  gfLog[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i += 1) gfExp[i] = gfExp[i - 255];

const gfMul = (a: number, b: number) => {
  if (a === 0 || b === 0) return 0;
  return gfExp[gfLog[a] + gfLog[b]];
};

const reedSolomonGenerator = (degree: number) => {
  let poly = [1];
  for (let i = 0; i < degree; i += 1) {
    const next = new Array(poly.length + 1).fill(0);
    poly.forEach((coef, index) => {
      next[index] ^= coef;
      next[index + 1] ^= gfMul(coef, gfExp[i]);
    });
    poly = next;
  }
  return poly;
};

const reedSolomonRemainder = (data: number[], degree: number) => {
  const generator = reedSolomonGenerator(degree);
  const result = new Array(degree).fill(0);
  data.forEach((value) => {
    const factor = value ^ result.shift()!;
    result.push(0);
    for (let i = 0; i < degree; i += 1) {
      result[i] ^= gfMul(generator[i + 1], factor);
    }
  });
  return result;
};

const pushBits = (bits: number[], value: number, count: number) => {
  for (let i = count - 1; i >= 0; i -= 1) {
    bits.push((value >>> i) & 1);
  }
};

const chooseVersion = (byteLength: number) => {
  for (let version = 1; version <= 10; version += 1) {
    if (byteLength <= maxByteLength(version)) return version;
  }
  throw new Error("This QR generator supports about 270 bytes. Shorten the text or URL.");
};

const dataCodewords = (text: string, version: number) => {
  const bytes = Array.from(new TextEncoder().encode(text));
  const bits: number[] = [];
  pushBits(bits, 0b0100, 4);
  pushBits(bits, bytes.length, byteCountBits(version));
  bytes.forEach((byte) => pushBits(bits, byte, 8));
  const maxBits = dataCodewordCount(version) * 8;
  pushBits(bits, 0, Math.min(4, maxBits - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    codewords.push(bits.slice(i, i + 8).reduce((sum, bit) => (sum << 1) | bit, 0));
  }
  for (let pad = 0; codewords.length < dataCodewordCount(version); pad += 1) {
    codewords.push(pad % 2 === 0 ? 0xec : 0x11);
  }
  return codewords;
};

const interleaveCodewords = (data: number[], version: number) => {
  const blocks: Array<{ data: number[]; ecc: number[] }> = [];
  let offset = 0;
  BLOCKS_L[version].forEach((group) => {
    for (let i = 0; i < group.count; i += 1) {
      const blockData = data.slice(offset, offset + group.data);
      offset += group.data;
      blocks.push({
        data: blockData,
        ecc: reedSolomonRemainder(blockData, group.total - group.data),
      });
    }
  });
  const result: number[] = [];
  const maxDataLength = Math.max(...blocks.map((block) => block.data.length));
  for (let i = 0; i < maxDataLength; i += 1) {
    blocks.forEach((block) => {
      if (i < block.data.length) result.push(block.data[i]);
    });
  }
  const eccLength = blocks[0]?.ecc.length ?? 0;
  for (let i = 0; i < eccLength; i += 1) {
    blocks.forEach((block) => result.push(block.ecc[i]));
  }
  return result;
};

const makeMatrix = (size: number) => ({
  modules: Array.from({ length: size }, () => new Array<boolean>(size).fill(false)),
  reserved: Array.from({ length: size }, () => new Array<boolean>(size).fill(false)),
});

const setFunction = (
  modules: boolean[][],
  reserved: boolean[][],
  x: number,
  y: number,
  value: boolean,
) => {
  if (y < 0 || y >= modules.length || x < 0 || x >= modules.length) return;
  modules[y][x] = value;
  reserved[y][x] = true;
};

const drawFinder = (modules: boolean[][], reserved: boolean[][], left: number, top: number) => {
  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const x = left + dx;
      const y = top + dy;
      const inFinder = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
      const value =
        inFinder && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      setFunction(modules, reserved, x, y, value);
    }
  }
};

const drawAlignment = (modules: boolean[][], reserved: boolean[][], cx: number, cy: number) => {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      const value = Math.max(Math.abs(dx), Math.abs(dy)) !== 1;
      setFunction(modules, reserved, cx + dx, cy + dy, value);
    }
  }
};

const drawFunctionPatterns = (modules: boolean[][], reserved: boolean[][], version: number) => {
  const size = modules.length;
  drawFinder(modules, reserved, 0, 0);
  drawFinder(modules, reserved, size - 7, 0);
  drawFinder(modules, reserved, 0, size - 7);

  for (let i = 8; i < size - 8; i += 1) {
    setFunction(modules, reserved, i, 6, i % 2 === 0);
    setFunction(modules, reserved, 6, i, i % 2 === 0);
  }

  const positions = ALIGNMENT_POSITIONS[version] ?? [];
  positions.forEach((x) => {
    positions.forEach((y) => {
      const nearTopLeft = x === 6 && y === 6;
      const nearTopRight = x === size - 7 && y === 6;
      const nearBottomLeft = x === 6 && y === size - 7;
      if (!nearTopLeft && !nearTopRight && !nearBottomLeft) drawAlignment(modules, reserved, x, y);
    });
  });

  setFunction(modules, reserved, 8, size - 8, true);
  for (let i = 0; i < 9; i += 1) {
    if (i !== 6) {
      setFunction(modules, reserved, 8, i, false);
      setFunction(modules, reserved, i, 8, false);
    }
  }
  for (let i = 0; i < 8; i += 1) {
    setFunction(modules, reserved, size - 1 - i, 8, false);
    setFunction(modules, reserved, 8, size - 1 - i, false);
  }

  if (version >= 7) drawVersionBits(modules, reserved, version);
};

const bchVersionBits = (version: number) => {
  let data = version << 12;
  const generator = 0x1f25;
  for (let i = 17; i >= 12; i -= 1) {
    if (((data >>> i) & 1) !== 0) data ^= generator << (i - 12);
  }
  return (version << 12) | (data & 0xfff);
};

const drawVersionBits = (modules: boolean[][], reserved: boolean[][], version: number) => {
  const size = modules.length;
  const bits = bchVersionBits(version);
  for (let i = 0; i < 18; i += 1) {
    const bit = ((bits >>> i) & 1) !== 0;
    const a = size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    setFunction(modules, reserved, a, b, bit);
    setFunction(modules, reserved, b, a, bit);
  }
};

const mask = (maskId: number, x: number, y: number) => {
  switch (maskId) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
};

const drawData = (modules: boolean[][], reserved: boolean[][], bits: number[]) => {
  const size = modules.length;
  let bitIndex = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;
    for (let row = 0; row < size; row += 1) {
      const y = upward ? size - 1 - row : row;
      for (let col = 0; col < 2; col += 1) {
        const x = right - col;
        if (!reserved[y][x]) {
          modules[y][x] = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
          bitIndex += 1;
        }
      }
    }
    upward = !upward;
  }
};

const bchFormatBits = (format: number) => {
  let data = format << 10;
  const generator = 0x537;
  for (let i = 14; i >= 10; i -= 1) {
    if (((data >>> i) & 1) !== 0) data ^= generator << (i - 10);
  }
  return ((format << 10) | (data & 0x3ff)) ^ 0x5412;
};

const setModule = (modules: boolean[][], x: number, y: number, value: boolean) => {
  modules[y][x] = value;
};

const drawFormatBits = (modules: boolean[][], maskId: number) => {
  const size = modules.length;
  const bits = bchFormatBits((1 << 3) | maskId);
  for (let i = 0; i <= 5; i += 1) setModule(modules, 8, i, ((bits >>> i) & 1) !== 0);
  setModule(modules, 8, 7, ((bits >>> 6) & 1) !== 0);
  setModule(modules, 8, 8, ((bits >>> 7) & 1) !== 0);
  setModule(modules, 7, 8, ((bits >>> 8) & 1) !== 0);
  for (let i = 9; i < 15; i += 1) setModule(modules, 14 - i, 8, ((bits >>> i) & 1) !== 0);
  for (let i = 0; i < 8; i += 1) setModule(modules, size - 1 - i, 8, ((bits >>> i) & 1) !== 0);
  for (let i = 8; i < 15; i += 1) setModule(modules, 8, size - 15 + i, ((bits >>> i) & 1) !== 0);
  setModule(modules, 8, size - 8, true);
};

const cloneModules = (modules: boolean[][]) => modules.map((row) => [...row]);

const applyMask = (modules: boolean[][], reserved: boolean[][], maskId: number) => {
  const masked = cloneModules(modules);
  for (let y = 0; y < masked.length; y += 1) {
    for (let x = 0; x < masked.length; x += 1) {
      if (!reserved[y][x] && mask(maskId, x, y)) masked[y][x] = !masked[y][x];
    }
  }
  drawFormatBits(masked, maskId);
  return masked;
};

const penalty = (modules: boolean[][]) => {
  const size = modules.length;
  let score = 0;
  for (let y = 0; y < size; y += 1) {
    let runColor = modules[y][0];
    let runLength = 1;
    for (let x = 1; x < size; x += 1) {
      if (modules[y][x] === runColor) runLength += 1;
      else {
        if (runLength >= 5) score += 3 + runLength - 5;
        runColor = modules[y][x];
        runLength = 1;
      }
    }
    if (runLength >= 5) score += 3 + runLength - 5;
  }
  for (let x = 0; x < size; x += 1) {
    let runColor = modules[0][x];
    let runLength = 1;
    for (let y = 1; y < size; y += 1) {
      if (modules[y][x] === runColor) runLength += 1;
      else {
        if (runLength >= 5) score += 3 + runLength - 5;
        runColor = modules[y][x];
        runLength = 1;
      }
    }
    if (runLength >= 5) score += 3 + runLength - 5;
  }
  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const color = modules[y][x];
      if (modules[y][x + 1] === color && modules[y + 1][x] === color && modules[y + 1][x + 1] === color) {
        score += 3;
      }
    }
  }
  let dark = 0;
  modules.forEach((row) => row.forEach((value) => (dark += value ? 1 : 0)));
  const percent = (dark * 100) / (size * size);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;
  return score;
};

export interface QrResult {
  text: string;
  version: number;
  modules: boolean[][];
  size: number;
}

export const createQr = (text: string): QrResult => {
  const content = text.trim();
  if (!content) throw new Error("Enter text or a URL first.");
  const byteLength = new TextEncoder().encode(content).length;
  const version = chooseVersion(byteLength);
  const size = 17 + version * 4;
  const { modules, reserved } = makeMatrix(size);
  drawFunctionPatterns(modules, reserved, version);
  const data = dataCodewords(content, version);
  const codewords = interleaveCodewords(data, version);
  const bits: number[] = [];
  codewords.forEach((codeword) => pushBits(bits, codeword, 8));
  drawData(modules, reserved, bits);

  let best = applyMask(modules, reserved, 0);
  let bestScore = penalty(best);
  for (let maskId = 1; maskId < 8; maskId += 1) {
    const masked = applyMask(modules, reserved, maskId);
    const score = penalty(masked);
    if (score < bestScore) {
      best = masked;
      bestScore = score;
    }
  }

  return { text: content, version, modules: best, size };
};

export const drawQrToCanvas = (canvas: HTMLCanvasElement, modules: boolean[][], pixels = 512) => {
  const quiet = 4;
  const size = modules.length + quiet * 2;
  const scale = Math.floor(pixels / size);
  const actual = scale * size;
  canvas.width = actual;
  canvas.height = actual;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, actual, actual);
  ctx.fillStyle = "#0f172a";
  modules.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) ctx.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
    });
  });
};

export const wifiPayload = (ssid: string, password: string, security: string) => {
  const escape = (value: string) => value.replace(/([\\;,:"])/g, "\\$1");
  return `WIFI:T:${security};S:${escape(ssid)};P:${escape(password)};;`;
};
