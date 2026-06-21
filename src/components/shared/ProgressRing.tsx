'use client';

/**
 * ProgressRing — SVG circular progress indicator with animation.
 */

import { useEffect, useRef } from 'react';

interface ProgressRingProps {
  percent: number; // 0-100
  size?: number;   // px
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  children?: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export function ProgressRing({
  percent,
  size = 80,
  strokeWidth = 6,
  color = '#34d399',
  trackColor = '#1e293b',
  label,
  children,
  className = '',
  animated = true,
}: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  useEffect(() => {
    if (!animated || !circleRef.current) return;
    const circle = circleRef.current;
    circle.style.transition = 'none';
    circle.style.strokeDashoffset = `${circumference}`;
    // Force reflow
    void circle.getBoundingClientRect();
    circle.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)';
    circle.style.strokeDashoffset = `${offset}`;
  }, [percent, circumference, offset, animated]);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${Math.round(percent)}% progress`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : offset}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
}
