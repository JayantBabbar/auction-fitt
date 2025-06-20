
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Key } from 'lucide-react';

interface SecretKeyDialogProps {
  secretKey: string;
  setSecretKey: (key: string) => void;
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
}

const SecretKeyDialog: React.FC<SecretKeyDialogProps> = ({
  secretKey,
  setSecretKey,
  showDialog,
  setShowDialog
}) => {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="w-full mb-4">
          <Key className="h-4 w-4 mr-2" />
          Setup Clerk Secret Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Clerk Secret Key</DialogTitle>
          <DialogDescription>
            Your Clerk secret key (starts with 'sk_') for creating users
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="secret-key">Secret Key</Label>
            <Input
              id="secret-key"
              type="password"
              placeholder="sk_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setShowDialog(false)}
            disabled={!secretKey}
            className="w-full"
          >
            Save Secret Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecretKeyDialog;
