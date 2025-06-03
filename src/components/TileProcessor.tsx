
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageData, TileConfig } from '@/pages/Index';
import { createTilesZip } from '@/utils/imageProcessor';

interface TileProcessorProps {
  imageData: ImageData;
  config: TileConfig;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export const TileProcessor: React.FC<TileProcessorProps> = ({
  imageData,
  config,
  isProcessing,
  setIsProcessing
}) => {
  const handleCreateTiles = async () => {
    setIsProcessing(true);
    
    try {
      await createTilesZip(imageData, config);
    } catch (error) {
      console.error('Error creating tiles:', error);
      alert('Failed to create tiles. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleCreateTiles}
        disabled={isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
      >
        {isProcessing ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Create Tiles & Download ZIP</span>
          </div>
        )}
      </Button>
      
      <div className="text-sm text-slate-600 space-y-1">
        <p>• Will create {config.rows * config.cols} individual {config.outputFormat.toUpperCase()} files</p>
        <p>• Files will be named systematically (tile_001, tile_002, etc.)</p>
        <p>• All tiles will be packaged in a single ZIP file</p>
      </div>
    </div>
  );
};
