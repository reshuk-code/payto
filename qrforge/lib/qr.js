import QRCode from 'qrcode';

// Error correction "M" survives ~15% damage: a good default for printed codes.
function options(code, extra = {}) {
  return {
    errorCorrectionLevel: 'M',
    margin: 2,
    color: { dark: code.fg_color, light: code.bg_color },
    ...extra,
  };
}

export function qrSvg(text, code) {
  return QRCode.toString(text, options(code, { type: 'svg' }));
}

export function qrPng(text, code, width = 1024) {
  return QRCode.toBuffer(text, options(code, { type: 'png', width }));
}

export function qrDataUrl(text, code, width = 320) {
  return QRCode.toDataURL(text, options(code, { width }));
}
