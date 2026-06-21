'use client';

/**
 * DebounceSlider — Range input with 200ms debounce and full a11y support.
 * Fires onChange immediately on display, debounces the store update.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface DebounceSliderProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  debounceMs?: number;
  formatValue?: (value: number) => string;
  unit?: string;
  className?: string;
  disabled?: boolean;
  colorClass?: string; // Tailwind accent color class
}

export function DebounceSlider({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  debounceMs = 200,
  formatValue,
  unit = '',
  className = '',
  disabled = false,
  colorClass = 'accent-emerald-500',
}: DebounceSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRegionRef = useRef<HTMLSpanElement>(null);

  // Sync when prop changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.target.value);
      setLocalValue(parsed);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(parsed);
      }, debounceMs);
    },
    [onChange, debounceMs],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const displayText = formatValue ? formatValue(localValue) : `${localValue}${unit}`;
  const percentage = ((localValue - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-300"
        >
          {label}
        </label>
        <span
          className="text-sm font-semibold text-emerald-400 tabular-nums"
          aria-live="polite"
          aria-atomic="true"
          ref={liveRegionRef}
        >
          {displayText}
        </span>
      </div>

      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          aria-label={`${label}: ${displayText}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValue}
          aria-valuetext={displayText}
          className={`
            w-full h-2 rounded-full appearance-none cursor-pointer
            bg-slate-700 outline-none
            focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900
            disabled:opacity-50 disabled:cursor-not-allowed
            ${colorClass}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-emerald-400
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-125
          `}
          style={{
            background: `linear-gradient(to right, #34d399 ${percentage}%, #334155 ${percentage}%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>{formatValue ? formatValue(min) : `${min}${unit}`}</span>
        <span>{formatValue ? formatValue(max) : `${max}${unit}`}</span>
      </div>
    </div>
  );
}
