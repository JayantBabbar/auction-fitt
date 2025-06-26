
import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface AuctionImageProps {
  primaryImage: string | null;
  title: string;
}

const AuctionImage = ({ primaryImage, title }: AuctionImageProps) => {
  return (
    <div className="flex-shrink-0">
      {primaryImage ? (
        <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
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
  );
};

export default AuctionImage;
