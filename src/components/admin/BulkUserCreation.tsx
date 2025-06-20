
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Users, Database, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBulkUserCreation } from '@/hooks/useBulkUserCreation';
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
  
  const { isCreating, handleBulkUserCreation } = useBulkUserCreation();

  const onBulkCreate = async () => {
    if (bulkUsers.length === 0) {
      return;
    }

    console.log(`Starting bulk creation for ${bulkUsers.length} users`);
    const success = await handleBulkUserCreation(bulkUsers);
    
    if (success) {
      // Clear the form after successful creation
      setBulkUsers([]);
      setCsvText('');
      console.log('Bulk creation completed, form cleared');
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
            Create multiple users at once using Supabase Auth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Direct Supabase Integration:</strong> 
              This feature uses Supabase Auth directly for fast and secure user creation.
              Users will be created with email confirmation enabled and profiles will be automatically generated.
            </AlertDescription>
          </Alert>

          {bulkUsers.length === 0 && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Getting Started:</strong> 
                Use the "Load Existing User List" button below to load the user data from your uploaded list, 
                then parse the CSV data and create the users.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <CsvUserManager
              users={bulkUsers}
              setUsers={setBulkUsers}
              csvText={csvText}
              setCsvText={setCsvText}
            />

            <Button 
              onClick={onBulkCreate}
              disabled={isCreating || bulkUsers.length === 0}
              className="w-full"
              size="lg"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Users... ({bulkUsers.length} total)
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Create {bulkUsers.length} Users
                </>
              )}
            </Button>

            <UserPreview users={bulkUsers} />

            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Database className="h-4 w-4" />
                How it works:
              </h4>
              <div className="text-sm space-y-2 text-muted-foreground">
                <p>This feature creates users directly in Supabase:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Users are created in Supabase Auth with email confirmation enabled</li>
                  <li>User profiles are automatically created via database trigger</li>
                  <li>Roles are assigned based on your CSV data (default: bidder)</li>
                  <li>Password reset will be required for bulk-created users on first login</li>
                  <li>No external API calls - everything happens within Supabase</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUserCreation;
