/**
 * Color conversion utilities
 */

/**
 * Converts OKLCH color values to RGB
 * @param l Lightness (0-1)
 * @param c Chroma (0-0.4, typically)
 * @param h Hue in degrees (0-360)
 * @returns RGB object with r, g, b values (0-255)
 */
export function oklchToRgb(
  l: number,
  c: number,
  h: number,
): { r: number; g: number; b: number } {
  // Convert OKLCH to OKLab
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // Convert OKLab to linear RGB
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l_cubed = l_ * l_ * l_;
  const m_cubed = m_ * m_ * m_;
  const s_cubed = s_ * s_ * s_;

  const linearR =
    +4.0767416621 * l_cubed - 3.3077115913 * m_cubed + 0.2309699292 * s_cubed;
  const linearG =
    -1.2684380046 * l_cubed + 2.6097574011 * m_cubed - 0.3413193965 * s_cubed;
  const linearB =
    -0.0041960863 * l_cubed - 0.7034186147 * m_cubed + 1.707614701 * s_cubed;

  // Convert linear RGB to sRGB
  const sRgbR = linearToSrgb(linearR);
  const sRgbG = linearToSrgb(linearG);
  const sRgbB = linearToSrgb(linearB);

  // Convert to 0-255 range and clamp
  return {
    r: Math.round(Math.max(0, Math.min(255, sRgbR * 255))),
    g: Math.round(Math.max(0, Math.min(255, sRgbG * 255))),
    b: Math.round(Math.max(0, Math.min(255, sRgbB * 255))),
  };
}

/**
 * Converts linear RGB to sRGB using gamma correction
 */
function linearToSrgb(value: number): number {
  if (value <= 0.0031308) {
    return 12.92 * value;
  } else {
    return 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
  }
}

/**
 * Parses an OKLCH string and converts it to RGB
 * @param oklchString String in format "oklch(0.3483 0.0774 148.98)" or "oklch(34.83% 0.0774 148.98)"
 * @returns RGB object with r, g, b values (0-255)
 */
export function parseOklchToRgb(oklchString: string): {
  r: number;
  g: number;
  b: number;
} {
  // Remove "oklch(" and ")" and split by spaces
  const values = oklchString
    .replace(/oklch\(|\)/g, '')
    .trim()
    .split(/\s+/);

  if (values.length !== 3) {
    throw new Error('Invalid OKLCH string format. Expected: oklch(l c h)');
  }

  let l = parseFloat(values[0]);
  const c = parseFloat(values[1]);
  const h = parseFloat(values[2]);

  // Handle percentage values for lightness
  if (values[0].includes('%')) {
    l = l / 100;
  }

  if (isNaN(l) || isNaN(c) || isNaN(h)) {
    throw new Error('Invalid OKLCH values. All values must be numbers.');
  }

  return oklchToRgb(l, c, h);
}

/**
 * Converts RGB values to a CSS rgb string
 * @param r Red value (0-255)
 * @param g Green value (0-255)
 * @param b Blue value (0-255)
 * @returns CSS rgb string
 */
export function rgbToString(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts RGB values to a hex string
 * @param r Red value (0-255)
 * @param g Green value (0-255)
 * @param b Blue value (0-255)
 * @returns Hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, value))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Complete conversion from OKLCH string to various RGB formats
 * @param oklchString OKLCH string to convert
 * @returns Object with rgb values and formatted strings
 */
export function convertOklch(oklchString: string) {
  const rgb = parseOklchToRgb(oklchString);

  return {
    ...rgb,
    rgbString: rgbToString(rgb.r, rgb.g, rgb.b),
    hex: rgbToHex(rgb.r, rgb.g, rgb.b),
  };
}

// Example usage:
// const result = convertOklch('oklch(0.3483 0.0774 148.98)');
// console.log(result); // { r: 45, g: 89, b: 62, rgbString: 'rgb(45, 89, 62)', hex: '#2d593e' }
