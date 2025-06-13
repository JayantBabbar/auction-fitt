
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface BidIncrementWarningProps {
  isOpen: boolean;
  onClose: () => void;
  currentBid: number;
  bidIncrement: number;
  enteredAmount: number;
}

const BidIncrementWarning = ({ 
  isOpen, 
  onClose, 
  currentBid, 
  bidIncrement, 
  enteredAmount 
}: BidIncrementWarningProps) => {
  const minNextBid = currentBid + bidIncrement;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">Invalid Bid Amount</DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3 pt-3">
            <p>
              Your bid of <span className="font-semibold">₹{enteredAmount.toLocaleString()}</span> does not follow the bid increment rules.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg space-y-1 text-sm">
              <p><span className="font-medium">Current Bid:</span> ₹{currentBid.toLocaleString()}</p>
              <p><span className="font-medium">Bid Increment:</span> ₹{bidIncrement.toLocaleString()}</p>
              <p><span className="font-medium">Minimum Next Bid:</span> ₹{minNextBid.toLocaleString()}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Please ensure your bid is at least ₹{minNextBid.toLocaleString()} and follows increments of ₹{bidIncrement.toLocaleString()}.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BidIncrementWarning;
