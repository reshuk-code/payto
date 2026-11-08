'use client';

import { useActionState, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { colorProblem } from '@/lib/colors';

const PRESETS = [
  { fg: '#000000', bg: '#ffffff', label: 'Classic' },
  { fg: '#1c1917', bg: '#fff7ed', label: 'Warm' },
  { fg: '#1e3a8a', bg: '#ffffff', label: 'Navy' },
  { fg: '#14532d', bg: '#f0fdf4', label: 'Forest' },
  { fg: '#7f1d1d', bg: '#fef2f2', label: 'Wine' },
];

export default function CodeForm({ action, initial, previewUrl, submitLabel, showPreview = true }) {
  const [state, formAction, pending] = useActionState(action, null);
  const [name, setName] = useState(initial?.name ?? '');
  const [destination, setDestination] = useState(initial?.destination ?? '');
  const [fg, setFg] = useState(initial?.fgColor ?? '#000000');
  const [bg, setBg] = useState(initial?.bgColor ?? '#ffffff');
  const [preview, setPreview] = useState(null);
  // Hide the last result message once the user starts editing again.
  const [editedAfter, setEditedAfter] = useState(null);
  const showResult = state && editedAfter !== state;
  const edited = (setter) => (value) => {
    setter(value);
    setEditedAfter(state);
  };

  const colorWarning = colorProblem(fg, bg);

  useEffect(() => {
    if (!showPreview) return;
    let cancelled = false;
    QRCode.toDataURL(previewUrl, { errorCorrectionLevel: 'M', margin: 2, width: 280, color: { dark: fg, light: bg } })
      .then((url) => !cancelled && setPreview(url))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [previewUrl, fg, bg, showPreview]);

  return (
    <form action={formAction} className="grid gap-8 md:grid-cols-[1fr_auto]">
      <div className="space-y-5">
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input
            id="name"
            name="name"
            className="input"
            placeholder="Lunch menu, Table 4"
            maxLength={80}
            required
            value={name}
            onChange={(e) => edited(setName)(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-stone-500">Only you see this.</p>
        </div>

        <div>
          <label htmlFor="destination" className="label">Where should it go?</label>
          <input
            id="destination"
            name="destination"
            className="input"
            placeholder="example.com/menu"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            required
            value={destination}
            onChange={(e) => edited(setDestination)(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-stone-500">You can change this anytime, even after printing.</p>
        </div>

        <fieldset>
          <legend className="label">Colors</legend>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const selected = p.fg === fg && p.bg === bg;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    edited(setFg)(p.fg);
                    setBg(p.bg);
                  }}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                    selected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded" style={{ background: p.bg, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15)' }}>
                    <span className="h-2 w-2 rounded-sm" style={{ background: p.fg }} />
                  </span>
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <ColorInput id="fgColor" label="Code" value={fg} onChange={edited(setFg)} />
            <ColorInput id="bgColor" label="Background" value={bg} onChange={edited(setBg)} />
          </div>
          {colorWarning && <p className="mt-2 text-sm text-amber-700">{colorWarning}</p>}
        </fieldset>

        {showResult && state.error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}
        {showResult && state.ok && (
          <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{state.message}</p>
        )}

        <button disabled={pending || Boolean(colorWarning)} className="btn-primary w-full sm:w-auto">
          {pending ? 'Saving…' : submitLabel}
        </button>
      </div>

      {showPreview && (
        <div className="order-first md:order-none">
          <div className="card mx-auto w-fit p-4 md:sticky md:top-6">
            <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg sm:h-[240px] sm:w-[240px]" style={{ background: bg }}>
              {preview && <img src={preview} alt="QR code preview" className="h-full w-full rounded-lg" />}
            </div>
            <p className="mt-3 text-center text-xs text-stone-500">Live preview</p>
          </div>
        </div>
      )}
    </form>
  );
}

function ColorInput({ id, label, value, onChange }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-2.5 py-2">
      <input
        id={id}
        name={id}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
      />
      <span className="text-sm">
        <span className="block text-xs text-stone-500">{label}</span>
        <span className="font-mono text-xs uppercase">{value}</span>
      </span>
    </label>
  );
}
