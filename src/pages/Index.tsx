
import React, { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { TilePreview } from '@/components/TilePreview';
import { TileProcessor } from '@/components/TileProcessor';
import { Card } from '@/components/ui/card';

export interface ImageData {
  file: File;
  url: string;
  width: number;
  height: number;
}

export interface TileConfig {
  rows: number;
  cols: number;
  /**
   * Positions of horizontal split lines as fractions (0-1) of image height.
   * Length should be rows - 1.
   */
  rowSplits: number[];
  /**
   * Positions of vertical split lines as fractions (0-1) of image width.
   * Length should be cols - 1.
   */
  colSplits: number[];
  outputFormat: 'png' | 'jpg';
  quality: number;
}

const Index = () => {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const createSplits = (count: number) =>
    Array.from({ length: count - 1 }, (_, i) => (i + 1) / count);

  const [tileConfig, setTileConfig] = useState<TileConfig>({
    rows: 3,
    cols: 3,
    rowSplits: createSplits(3),
    colSplits: createSplits(3),
    outputFormat: 'png',
    quality: 90
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (data: ImageData) => {
    setImageData(data);
  };

  const handleConfigChange = (config: Partial<TileConfig>) => {
    setTileConfig(prev => ({ ...prev, ...config }));
  };

  const handleRowsChange = (rows: number) => {
    const newRows = Math.max(1, Math.min(20, rows));
    setTileConfig(prev => ({
      ...prev,
      rows: newRows,
      rowSplits: createSplits(newRows)
    }));
  };

  const handleColsChange = (cols: number) => {
    const newCols = Math.max(1, Math.min(20, cols));
    setTileConfig(prev => ({
      ...prev,
      cols: newCols,
      colSplits: createSplits(newCols)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Image Tile Splitter
          </h1>
          <p className="text-lg text-slate-600">
            Upload an image, configure your tiles, and download them as a ZIP file
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Upload and Configuration */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                1. Upload Image
              </h2>
              <ImageUploader onImageUpload={handleImageUpload} />
            </Card>

            {imageData && (
              <>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">
                    2. Configure Tiles
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Rows
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={tileConfig.rows}
                          onChange={(e) => handleRowsChange(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Columns
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={tileConfig.cols}
                          onChange={(e) => handleColsChange(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Output Format
                      </label>
                      <select
                        value={tileConfig.outputFormat}
                        onChange={(e) => handleConfigChange({ outputFormat: e.target.value as 'png' | 'jpg' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="png">PNG (Lossless)</option>
                        <option value="jpg">JPG (Compressed)</option>
                      </select>
                    </div>

                    {tileConfig.outputFormat === 'jpg' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Quality: {tileConfig.quality}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={tileConfig.quality}
                          onChange={(e) => handleConfigChange({ quality: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    )}

                    <div className="bg-slate-100 p-3 rounded-md">
                      <p className="text-sm text-slate-600">
                        Total tiles: <span className="font-semibold">{tileConfig.rows * tileConfig.cols}</span>
                      </p>
                      <p className="text-sm text-slate-600">
                        Tile size: <span className="font-semibold">
                          {(() => {
                            const equalRows = tileConfig.rowSplits.every((v, i) => Math.abs(v - (i + 1) / tileConfig.rows) < 0.001);
                            const equalCols = tileConfig.colSplits.every((v, i) => Math.abs(v - (i + 1) / tileConfig.cols) < 0.001);
                            if (equalRows && equalCols) {
                              return `${Math.floor(imageData.width / tileConfig.cols)}x${Math.floor(imageData.height / tileConfig.rows)}px`;
                            }
                            return 'Variable';
                          })()}
                        </span>
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">
                    3. Create & Download
                  </h2>
                  <TileProcessor
                    imageData={imageData}
                    config={tileConfig}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </Card>
              </>
            )}
          </div>

          {/* Right Column - Preview */}
          <div>
            {imageData && (
              <Card className="p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">
                  Preview
                </h2>
                <TilePreview
                  imageData={imageData}
                  config={tileConfig}
                  onConfigChange={handleConfigChange}
                />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
