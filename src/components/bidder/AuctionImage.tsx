
import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface AuctionImageProps {
  primaryImage: string | null;
  title: string;
}

const AuctionImage = ({ primaryImage, title }: AuctionImageProps) => {
  const [isEnlarged, setIsEnlarged] = useState(false);

  const handleImageClick = () => {
    if (primaryImage) {
      setIsEnlarged(true);
    }
  };

  return (
    <>
      <div className="flex-shrink-0">
        {primaryImage ? (
          <div 
            className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleImageClick}
          >
            <img
              src={primaryImage}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop';
              }}
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-slate-400" />
          </div>
        )}
      </div>

      <Dialog open={isEnlarged} onOpenChange={setIsEnlarged}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <button
              onClick={() => setIsEnlarged(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            {primaryImage && (
              <img
                src={primaryImage}
                alt={title}
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop';
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuctionImage;
