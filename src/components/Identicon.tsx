import React, { useMemo } from 'react';
import { generateIdenticonData } from '../utils/identicon';

interface IdenticonProps {
  seed: string;
  size?: number;
  className?: string;
  showBorder?: boolean;
  alt?: string;
}

export const Identicon: React.FC<IdenticonProps> = ({
  seed,
  size = 40,
  className = '',
  showBorder = true,
  alt = 'GitHub-style Identicon Avatar',
}) => {
  const { grid, color, bgColor } = useMemo(() => {
    return generateIdenticonData(seed || 'user');
  }, [seed]);

  // GitHub identicons use ~8% outer margin
  const padding = size * 0.08;
  const cellSize = (size - padding * 2) / 5;
  const borderRadius = Math.max(4, size * 0.2);

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden select-none shrink-0 ${
        showBorder ? 'ring-1 ring-white/10 shadow-sm' : ''
      } ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: bgColor,
      }}
      title={alt}
      aria-label={alt}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        {grid.map((row, r) =>
          row.map((active, c) => {
            if (!active) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={padding + c * cellSize}
                y={padding + r * cellSize}
                width={cellSize + 0.2} // slight overlap to prevent subpixel hairline gap
                height={cellSize + 0.2}
                fill={color}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};
