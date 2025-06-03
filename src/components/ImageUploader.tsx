
import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { ImageData } from '@/pages/Index';

interface ImageUploaderProps {
  onImageUpload: (imageData: ImageData) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageLoad = useCallback((file: File) => {
    setIsLoading(true);
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
      alert('Failed to load image. Please try a different file.');
    };
    
    img.src = url;
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleImageLoad(imageFile);
    } else {
      alert('Please upload a valid image file (JPG, PNG, WEBP).');
    }
  }, [handleImageLoad]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageLoad(file);
    }
  };

  return (
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
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={isLoading}
      />
      
      {isLoading ? (
        <div className="space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-600">Loading image...</p>
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
              Drag & drop or click to select • JPG, PNG, WEBP
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
