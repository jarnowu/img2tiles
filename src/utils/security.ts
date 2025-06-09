
// Recommended maximum file size in bytes (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed MIME types
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

// File magic numbers (first few bytes) for validation
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF],
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF header (followed by WEBP at offset 8)
  ],
};

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export const validateFileSize = (file: File): FileValidationResult => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: true,
      warning: `File size exceeds ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB. Processing may be slow.`
    };
  }
  return { isValid: true };
};

export const validateMimeType = (file: File): FileValidationResult => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a JPG, PNG, or WEBP image.'
    };
  }
  return { isValid: true };
};

export const validateFileSignature = async (file: File): Promise<FileValidationResult> => {
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check for JPEG
    if (bytes.length >= 3 && 
        bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return { isValid: true };
    }
    
    // Check for PNG
    if (bytes.length >= 8 && 
        bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
        bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A) {
      return { isValid: true };
    }
    
    // Check for WEBP
    if (bytes.length >= 12 && 
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return { isValid: true };
    }
    
    return {
      isValid: false,
      error: 'File signature does not match a valid image format.'
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate file signature.'
    };
  }
};

export const validateImageFile = async (file: File): Promise<FileValidationResult> => {
  // Check file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  // Check MIME type
  const mimeValidation = validateMimeType(file);
  if (!mimeValidation.isValid) {
    return mimeValidation;
  }
  
  // Check file signature
  const signatureValidation = await validateFileSignature(file);
  if (!signatureValidation.isValid) {
    return signatureValidation;
  }

  if (sizeValidation.warning) {
    return { isValid: true, warning: sizeValidation.warning };
  }

  return { isValid: true };
};
