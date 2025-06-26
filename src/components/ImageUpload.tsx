
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  maxImages = 5,
  existingImages = []
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>(existingImages);
  const { uploadImage, uploading } = useImageUpload();
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (uploadedImages.length + acceptedFiles.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images.`,
        variant: "destructive",
      });
      return;
    }

    const newUrls: string[] = [];

    try {
      for (const file of acceptedFiles) {
        console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
        const url = await uploadImage(file);
        if (url) {
          console.log('Successfully uploaded, URL:', url);
          newUrls.push(url);
        }
      }

      const updatedImages = [...uploadedImages, ...newUrls];
      setUploadedImages(updatedImages);
      onImagesChange(updatedImages);

      if (newUrls.length > 0) {
        toast({
          title: "Images uploaded",
          description: `${newUrls.length} image(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    }
  }, [uploadedImages, maxImages, uploadImage, onImagesChange, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: uploading || uploadedImages.length >= maxImages
  });

  const removeImage = (indexToRemove: number) => {
    const updatedImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    setUploadedImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        {...getRootProps()} 
        className={`border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border/50 hover:border-primary/50'
        } ${uploading || uploadedImages.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <CardContent className="p-8 text-center">
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading images...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              
              {uploadedImages.length >= maxImages ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Maximum images reached
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You've uploaded {maxImages} images
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {isDragActive ? 'Drop images here' : 'Upload auction images'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drag & drop or click to select ({uploadedImages.length}/{maxImages})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports: JPEG, PNG, WebP (max 5MB each)
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploaded Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative group">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('Image loaded successfully:', url)}
                        onError={(e) => {
                          console.error('Image failed to load:', url);
                          // Fallback to a default image
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2">
                          <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            Primary
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
