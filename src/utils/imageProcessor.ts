
import JSZip from 'jszip';
import { ImageData, TileConfig } from '@/pages/Index';

export const createTilesZip = async (imageData: ImageData, config: TileConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = async () => {
      try {
        const zip = new JSZip();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }
        
        const tileWidth = Math.floor(img.naturalWidth / config.cols);
        const tileHeight = Math.floor(img.naturalHeight / config.rows);
        
        canvas.width = tileWidth;
        canvas.height = tileHeight;
        
        let tileIndex = 1;
        
        for (let row = 0; row < config.rows; row++) {
          for (let col = 0; col < config.cols; col++) {
            // Clear canvas
            ctx.clearRect(0, 0, tileWidth, tileHeight);
            
            // Calculate source coordinates
            const srcX = col * tileWidth;
            const srcY = row * tileHeight;
            
            // Draw the tile
            ctx.drawImage(
              img,
              srcX, srcY, tileWidth, tileHeight,
              0, 0, tileWidth, tileHeight
            );
            
            // Convert to blob
            const blob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
              }, `image/${config.outputFormat}`, config.quality / 100);
            });
            
            if (blob) {
              const fileName = `tile_${tileIndex.toString().padStart(3, '0')}.${config.outputFormat}`;
              zip.file(fileName, blob);
              tileIndex++;
            }
          }
        }
        
        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // Download the ZIP file
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${imageData.file.name.split('.')[0]}_tiles.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageData.url;
  });
};
