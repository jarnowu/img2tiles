
import JSZip from 'jszip';
import { ImageData, TileConfig } from '@/pages/Index';

// Maximum canvas size to prevent memory issues
const MAX_CANVAS_SIZE = 8192;

export const createTilesZip = async (imageData: ImageData, config: TileConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = async () => {
      try {
        // Security check: Validate image dimensions
        if (img.naturalWidth > MAX_CANVAS_SIZE || img.naturalHeight > MAX_CANVAS_SIZE) {
          throw new Error(`Image dimensions too large. Maximum allowed size is ${MAX_CANVAS_SIZE}x${MAX_CANVAS_SIZE} pixels.`);
        }
        
        // Security check: Validate tile configuration
        if (config.rows < 1 || config.rows > 20 || config.cols < 1 || config.cols > 20) {
          throw new Error('Invalid tile configuration. Rows and columns must be between 1 and 20.');
        }
        
        const zip = new JSZip();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }
        
        const rowPositions = [0, ...config.rowSplits, 1];
        const colPositions = [0, ...config.colSplits, 1];

        let tileIndex = 1;

        for (let r = 0; r < config.rows; r++) {
          const srcY = Math.floor(rowPositions[r] * img.naturalHeight);
          const nextY = Math.floor(rowPositions[r + 1] * img.naturalHeight);
          const tileHeight = nextY - srcY;

          for (let c = 0; c < config.cols; c++) {
            const srcX = Math.floor(colPositions[c] * img.naturalWidth);
            const nextX = Math.floor(colPositions[c + 1] * img.naturalWidth);
            const tileWidth = nextX - srcX;

            if (tileWidth < 1 || tileHeight < 1) {
              throw new Error('Calculated tile dimensions are too small. Adjust grid lines.');
            }

            canvas.width = tileWidth;
            canvas.height = tileHeight;

            // Clear canvas
            ctx.clearRect(0, 0, tileWidth, tileHeight);

            // Draw the tile
            ctx.drawImage(
              img,
              srcX,
              srcY,
              tileWidth,
              tileHeight,
              0,
              0,
              tileWidth,
              tileHeight
            );
            
            // Convert to blob with validation
            const blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Failed to create image blob'));
                }
              }, `image/${config.outputFormat}`, config.quality / 100);
            });
            
            // Security check: Validate blob size
            if (blob.size > 10 * 1024 * 1024) { // 10MB per tile
              throw new Error('Generated tile size is too large. Please reduce quality or image size.');
            }
            
            const fileName = `tile_${tileIndex.toString().padStart(3, '0')}.${config.outputFormat}`;
            zip.file(fileName, blob);
            tileIndex++;
          }
        }
        
        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ 
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        });
        
        // Security check: Validate final ZIP size
        if (zipBlob.size > 500 * 1024 * 1024) { // 500MB
          throw new Error('Generated ZIP file is too large. Please reduce image size or tile count.');
        }
        
        // Download the ZIP file
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        // Sanitize filename
        const sanitizedName = imageData.file.name.replace(/[^a-zA-Z0-9._-]/g, '_').split('.')[0];
        a.download = `${sanitizedName}_tiles.zip`;
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
