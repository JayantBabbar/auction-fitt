
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Users, Key, AlertTriangle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBulkUserCreation } from '@/hooks/useBulkUserCreation';
import SecretKeyDialog from './SecretKeyDialog';
import CsvUserManager from './CsvUserManager';
import UserPreview from './UserPreview';

interface User {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'bidder';
}

const BulkUserCreation = () => {
  const [bulkUsers, setBulkUsers] = useState<User[]>([]);
  const [csvText, setCsvText] = useState('');
  const [showSecretDialog, setShowSecretDialog] = useState(false);
  
  const { secretKey, setSecretKey, isCreating, handleBulkUserCreation } = useBulkUserCreation();

  const onBulkCreate = async () => {
    const success = await handleBulkUserCreation(bulkUsers);
    if (success) {
      setBulkUsers([]);
      setCsvText('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk User Creation
          </CardTitle>
          <CardDescription>
            Create multiple users at once using Clerk's Backend SDK
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Key className="h-4 w-4" />
            <AlertDescription>
              <strong>Backend Integration Required:</strong> 
              This feature requires a backend API endpoint to use Clerk's Backend SDK securely.
              You'll need to implement the `/api/create-user` endpoint on your server.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <SecretKeyDialog
              secretKey={secretKey}
              setSecretKey={setSecretKey}
              showDialog={showSecretDialog}
              setShowDialog={setShowSecretDialog}
            />

            <CsvUserManager
              users={bulkUsers}
              setUsers={setBulkUsers}
              csvText={csvText}
              setCsvText={setCsvText}
            />

            <Button 
              onClick={onBulkCreate}
              disabled={isCreating || bulkUsers.length === 0 || !secretKey}
              className="w-full"
            >
              {isCreating ? 'Creating Users...' : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Create {bulkUsers.length} Users
                </>
              )}
            </Button>

            <UserPreview users={bulkUsers} />

            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Backend Implementation Required:
              </h4>
              <div className="text-sm space-y-2 text-muted-foreground">
                <p>You need to create an API endpoint at <code>/api/create-user</code> that:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Uses Clerk's Backend SDK: <code>npm install @clerk/clerk-sdk-node</code></li>
                  <li>Calls <code>clerkClient.users.createUser()</code> with the user data</li>
                  <li>Handles the secret key securely on the server side</li>
                  <li>Returns success/error status to the frontend</li>
                </ol>
                <p className="mt-2">
                  <strong>Reference implementation available in:</strong> <code>src/api/create-user.ts</code>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUserCreation;
