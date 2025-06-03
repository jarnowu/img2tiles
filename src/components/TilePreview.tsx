
import React, { useEffect, useRef, useState } from 'react';
import { ImageData, TileConfig } from '@/pages/Index';

interface TilePreviewProps {
  imageData: ImageData;
  config: TileConfig;
  onConfigChange: (config: Partial<TileConfig>) => void;
}
export const TilePreview: React.FC<TilePreviewProps> = ({ imageData, config, onConfigChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{width: number; height: number}>({ width: 0, height: 0 });
  const [dragging, setDragging] = useState<{type: 'row'|'col'; index: number} | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const maxDisplayWidth = 400;
      const maxDisplayHeight = 400;

      let displayWidth = img.naturalWidth;
      let displayHeight = img.naturalHeight;

      if (displayWidth > maxDisplayWidth) {
        displayHeight = (displayHeight * maxDisplayWidth) / displayWidth;
        displayWidth = maxDisplayWidth;
      }

      if (displayHeight > maxDisplayHeight) {
        displayWidth = (displayWidth * maxDisplayHeight) / displayHeight;
        displayHeight = maxDisplayHeight;
      }

      canvas.width = displayWidth;
      canvas.height = displayHeight;
      setDimensions({ width: displayWidth, height: displayHeight });

      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
    };

    img.src = imageData.url;
  }, [imageData]);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (dragging.type === 'col') {
        let pos = (e.clientX - rect.left) / rect.width;
        const splits = [...config.colSplits];
        const min = dragging.index === 0 ? 0.05 : splits[dragging.index - 1] + 0.05;
        const max = dragging.index === splits.length - 1 ? 0.95 : splits[dragging.index + 1] - 0.05;
        pos = Math.min(Math.max(pos, min), max);
        splits[dragging.index] = pos;
        onConfigChange({ colSplits: splits });
      } else {
        let pos = (e.clientY - rect.top) / rect.height;
        const splits = [...config.rowSplits];
        const min = dragging.index === 0 ? 0.05 : splits[dragging.index - 1] + 0.05;
        const max = dragging.index === splits.length - 1 ? 0.95 : splits[dragging.index + 1] - 0.05;
        pos = Math.min(Math.max(pos, min), max);
        splits[dragging.index] = pos;
        onConfigChange({ rowSplits: splits });
      }
    };

    const stopDrag = () => setDragging(null);

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopDrag);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopDrag);
    };
  }, [dragging, config, onConfigChange]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="bg-white rounded-lg p-4 border border-slate-200 relative select-none"
      >
        <canvas
          ref={canvasRef}
          className="max-w-full border border-slate-200 rounded"
        />
        {dimensions.width > 0 && (
          <>
            {config.colSplits.map((pos, i) => (
              <div
                key={`col-${i}`}
                onPointerDown={() => setDragging({ type: 'col', index: i })}
                style={{ left: `${pos * 100}%` }}
                className="absolute top-0 bottom-0 w-1 -ml-0.5 bg-blue-500 cursor-ew-resize"
              />
            ))}
            {config.rowSplits.map((pos, i) => (
              <div
                key={`row-${i}`}
                onPointerDown={() => setDragging({ type: 'row', index: i })}
                style={{ top: `${pos * 100}%` }}
                className="absolute left-0 right-0 h-1 -mt-0.5 bg-blue-500 cursor-ns-resize"
              />
            ))}
            <div className="absolute inset-0 border border-blue-500 pointer-events-none" />
          </>
        )}
      </div>

      <div className="text-sm text-slate-600 space-y-1">
        <p>Original: {imageData.width}x{imageData.height}px</p>
        <p>Grid: {config.rows}x{config.cols} ({config.rows * config.cols} tiles)</p>
      </div>
    </div>
  );
};
