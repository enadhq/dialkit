import { useState, useRef, useEffect, useCallback } from 'react';

interface ColorControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

function useDetectTheme(ref: React.RefObject<HTMLElement | null>): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const isLight = !!el.closest('.dial-panel-light');
    setTheme(isLight ? 'light' : 'dark');
  }, [ref]);

  return theme;
}

export function ColorControl({ label, value, onChange }: ColorControlProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const internalChange = useRef(false);
  const theme = useDetectTheme(containerRef);

  useEffect(() => {
    import('hdr-color-input').then(() => setReady(true));
  }, []);

  useEffect(() => {
    const el = colorInputRef.current;
    if (!el || !ready) return;
    if (internalChange.current) {
      internalChange.current = false;
      return;
    }
    (el as any).value = value;
  }, [value, ready]);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  const handleChange = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail?.value) {
      internalChange.current = true;
      onChange(detail.value);
    }
  }, [onChange]);

  useEffect(() => {
    const el = colorInputRef.current;
    if (!el || !ready) return;
    el.addEventListener('change', handleChange);
    return () => el.removeEventListener('change', handleChange);
  }, [handleChange, ready]);

  function handleTextSubmit() {
    setIsEditing(false);
    if (HEX_COLOR_REGEX.test(editValue)) {
      onChange(editValue);
    } else {
      setEditValue(value);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value);
    }
  }

  function handleSwatchClick() {
    const el = colorInputRef.current as any;
    const anchor = swatchRef.current;
    if (!el || !ready) return;
    if (el.show) {
      el.show(anchor);
    } else if (el.showPicker) {
      el.showPicker();
    }
  }

  return (
    <div className="dialkit-color-control" ref={containerRef}>
      <span className="dialkit-color-label">{label}</span>
      <div className="dialkit-color-inputs">
        {isEditing ? (
          <input
            type="text"
            className="dialkit-color-hex-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleTextSubmit}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <span
            className="dialkit-color-hex"
            onClick={() => setIsEditing(true)}
          >
            {(value ?? '').toUpperCase()}
          </span>
        )}
        <button
          ref={swatchRef}
          className="dialkit-color-swatch"
          style={{ backgroundColor: value }}
          onClick={handleSwatchClick}
          title="Pick color"
        />
        <color-input
          ref={colorInputRef}
          theme={theme}
          no-alpha
          className="dialkit-color-picker-hdr"
        />
      </div>
    </div>
  );
}
