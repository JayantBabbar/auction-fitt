
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Users, Download, Key, AlertTriangle, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'bidder';
}

const BulkUserCreation = () => {
  const { toast } = useToast();
  const [bulkUsers, setBulkUsers] = useState<User[]>([]);
  const [csvText, setCsvText] = useState('');
  const [defaultRole, setDefaultRole] = useState<'admin' | 'bidder'>('bidder');
  const [defaultPassword, setDefaultPassword] = useState('AuctionUser2024!');
  const [secretKey, setSecretKey] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showSecretDialog, setShowSecretDialog] = useState(false);

  const createUserWithClerk = async (user: User): Promise<boolean> => {
    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secretKey,
          user: {
            emailAddress: [user.email],
            password: user.password,
            firstName: user.name.split(' ')[0] || user.name,
            lastName: user.name.split(' ').slice(1).join(' ') || '',
            unsafeMetadata: {
              role: user.role
            }
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  };

  const parseCsvText = () => {
    const lines = csvText.trim().split('\n');
    const users: User[] = [];
    
    lines.forEach((line, index) => {
      const [name, email, password, role] = line.split(',').map(item => item.trim());
      
      if (name && email) {
        users.push({
          name,
          email,
          password: password || defaultPassword,
          role: (role as 'admin' | 'bidder') || defaultRole
        });
      }
    });
    
    setBulkUsers(users);
    toast({
      title: "CSV Parsed",
      description: `Found ${users.length} users to create`,
    });
  };

  const generateSampleUsers = () => {
    const sampleData = [];
    for (let i = 1; i <= 80; i++) {
      sampleData.push(`User ${i},user${i}@yourcompany.com,${defaultPassword},bidder`);
    }
    setCsvText(sampleData.join('\n'));
    toast({
      title: "Sample Data Generated",
      description: "Generated 80 sample users. Parse the CSV and then create users.",
    });
  };

  const handleBulkUserCreation = async () => {
    if (!secretKey.startsWith('sk_')) {
      toast({
        title: "Invalid Secret Key",
        description: "Please enter a valid Clerk secret key (starts with 'sk_')",
        variant: "destructive",
      });
      return;
    }

    if (bulkUsers.length === 0) {
      toast({
        title: "No Users to Create",
        description: "Please parse the CSV data first",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    let successCount = 0;
    let errorCount = 0;

    for (const user of bulkUsers) {
      const success = await createUserWithClerk(user);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    toast({
      title: "Bulk Creation Complete",
      description: `Created ${successCount} users successfully. ${errorCount} failed.`,
      variant: errorCount > 0 ? "destructive" : "default",
    });

    if (successCount > 0) {
      setBulkUsers([]);
      setCsvText('');
    }
    setIsCreating(false);
  };

  const downloadTemplate = () => {
    const csvContent = "name,email,password,role\nJohn Doe,john@yourcompany.com,SecurePass123!,bidder\nJane Admin,jane@yourcompany.com,AdminPass456!,admin";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_users_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
            <Dialog open={showSecretDialog} onOpenChange={setShowSecretDialog}>
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
                    onClick={() => setShowSecretDialog(false)}
                    disabled={!secretKey}
                    className="w-full"
                  >
                    Save Secret Key
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex gap-2 mb-4">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button variant="outline" onClick={generateSampleUsers}>
                <Users className="h-4 w-4 mr-2" />
                Generate 80 Sample Users
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="default-role">Default Role</Label>
                <Select value={defaultRole} onValueChange={(value: 'admin' | 'bidder') => setDefaultRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bidder">Bidder</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="default-password">Default Password</Label>
                <Input
                  id="default-password"
                  value={defaultPassword}
                  onChange={(e) => setDefaultPassword(e.target.value)}
                  placeholder="Default password for bulk users"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="csv-data">CSV Data (name,email,password,role)</Label>
              <Textarea
                id="csv-data"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="name,email,password,role&#10;John Doe,john@yourcompany.com,SecurePass123!,bidder&#10;Jane Admin,jane@yourcompany.com,AdminPass456!,admin"
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Format: name,email,password,role (one user per line). Use the "Generate 80 Sample Users" button to get started.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={parseCsvText}>
                Parse CSV ({csvText.trim().split('\n').filter(line => line.trim()).length} lines)
              </Button>
              <Button 
                onClick={handleBulkUserCreation}
                disabled={isCreating || bulkUsers.length === 0 || !secretKey}
                className="flex-1"
              >
                {isCreating ? 'Creating Users...' : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Create {bulkUsers.length} Users
                  </>
                )}
              </Button>
            </div>

            {bulkUsers.length > 0 && (
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Users to Create ({bulkUsers.length})</h4>
                <div className="max-h-40 overflow-y-auto">
                  {bulkUsers.slice(0, 10).map((user, index) => (
                    <div key={index} className="text-sm py-1 border-b last:border-b-0">
                      {user.name} ({user.email}) - {user.role}
                    </div>
                  ))}
                  {bulkUsers.length > 10 && (
                    <div className="text-sm py-1 text-muted-foreground">
                      ... and {bulkUsers.length - 10} more users
                    </div>
                  )}
                </div>
              </div>
            )}

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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUserCreation;
