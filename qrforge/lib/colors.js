// Color checks shared by the server and the browser preview (no Node-only imports).

export function isHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value ?? ''));
}

function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Many phone scanners fail on inverted (light-on-dark) or low-contrast codes.
export function colorProblem(fg, bg) {
  if (!isHexColor(fg) || !isHexColor(bg)) return 'Colors must be hex values like #112233.';
  if (relativeLuminance(fg) >= relativeLuminance(bg)) return 'The code color must be darker than the background.';
  if (contrastRatio(fg, bg) < 3) return 'Colors are too similar. Phones may fail to scan this code.';
  return null;
}
