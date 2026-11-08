'use client';

import { useState } from 'react';

export default function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy this link:', text);
    }
  }

  return (
    <button type="button" onClick={copy} className="btn-secondary px-3 py-1.5 text-xs">
      {copied ? 'Copied' : label}
    </button>
  );
}
