
import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { ImageData } from '@/pages/Index';
import { validateImageFile } from '@/utils/security';

interface ImageUploaderProps {
  onImageUpload: (imageData: ImageData) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageLoad = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate file security
      const validation = await validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        setIsLoading(false);
        return;
      }

      const url = URL.createObjectURL(file);
      const img = new Image();
      
      img.onload = () => {
        onImageUpload({
          file,
          url,
          width: img.naturalWidth,
          height: img.naturalHeight
        });
        setIsLoading(false);
      };
      
      img.onerror = () => {
        setIsLoading(false);
        setError('Failed to load image. The file may be corrupted or in an unsupported format.');
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (err) {
      setIsLoading(false);
      setError('An error occurred while processing the file.');
      console.error('Image processing error:', err);
    }
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageLoad(imageFile);
    } else {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
    }
  }, [handleImageLoad]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageLoad(file);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 hover:border-slate-400'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isLoading && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInput}
          className="hidden"
          disabled={isLoading}
        />
        
        {isLoading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-600">Processing image...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {isDragging ? (
              <Upload className="h-12 w-12 text-blue-500 mx-auto" />
            ) : (
              <ImageIcon className="h-12 w-12 text-slate-400 mx-auto" />
            )}
            <div>
              <p className="text-lg font-medium text-slate-700">
                {isDragging ? 'Drop your image here' : 'Upload an image'}
              </p>
              <p className="text-sm text-slate-500">
                Drag & drop or click to select • JPG, PNG, WEBP • Max 50MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-red-800 font-medium">Upload Error</h4>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
