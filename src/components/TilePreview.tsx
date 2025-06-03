
import React, { useEffect, useRef } from 'react';
import { ImageData, TileConfig } from '@/pages/Index';

interface TilePreviewProps {
  imageData: ImageData;
  config: TileConfig;
}

export const TilePreview: React.FC<TilePreviewProps> = ({ imageData, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate display size while maintaining aspect ratio
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
      
      // Draw the image
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
      
      // Draw grid overlay
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 2;
      
      const tileWidth = displayWidth / config.cols;
      const tileHeight = displayHeight / config.rows;
      
      // Draw vertical lines
      for (let i = 1; i < config.cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileWidth, 0);
        ctx.lineTo(i * tileWidth, displayHeight);
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let i = 1; i < config.rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * tileHeight);
        ctx.lineTo(displayWidth, i * tileHeight);
        ctx.stroke();
      }
      
      // Draw border
      ctx.strokeStyle = 'rgba(59, 130, 246, 1)';
      ctx.strokeRect(0, 0, displayWidth, displayHeight);
    };
    
    img.src = imageData.url;
  }, [imageData, config]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <canvas
          ref={canvasRef}
          className="max-w-full border border-slate-200 rounded"
        />
      </div>
      
      <div className="text-sm text-slate-600 space-y-1">
        <p>Original: {imageData.width}x{imageData.height}px</p>
        <p>Grid: {config.rows}x{config.cols} ({config.rows * config.cols} tiles)</p>
        <p>
          Each tile: {Math.floor(imageData.width / config.cols)}x{Math.floor(imageData.height / config.rows)}px
        </p>
      </div>
    </div>
  );
};
