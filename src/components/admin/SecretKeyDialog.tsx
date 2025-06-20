
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Database, CheckCircle } from 'lucide-react';

interface SecretKeyDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
}

const SecretKeyDialog: React.FC<SecretKeyDialogProps> = ({
  showDialog,
  setShowDialog
}) => {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Integration Active
          </DialogTitle>
          <DialogDescription>
            Your bulk user creation is now powered by Supabase Auth
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">Direct Supabase integration - no external APIs needed</span>
          </div>
          <Button 
            onClick={() => setShowDialog(false)}
            className="w-full"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecretKeyDialog;
