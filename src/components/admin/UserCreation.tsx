
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, UserPlus, Users, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'bidder';
}

const UserCreation = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [showSecretDialog, setShowSecretDialog] = useState(false);
  
  // Single user creation state
  const [singleUser, setSingleUser] = useState<User>({
    name: '',
    email: '',
    password: '',
    role: 'bidder'
  });

  // Bulk upload state
  const [bulkUsers, setBulkUsers] = useState<User[]>([]);
  const [csvText, setCsvText] = useState('');
  const [defaultRole, setDefaultRole] = useState<'admin' | 'bidder'>('bidder');
  const [defaultPassword, setDefaultPassword] = useState('TempPassword123!');

  const validateSecretKey = () => {
    if (!secretKey.startsWith('sk_')) {
      toast({
        title: "Invalid Secret Key",
        description: "Please enter a valid Clerk secret key (starts with 'sk_')",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const createUser = async (user: User): Promise<boolean> => {
    try {
      const response = await fetch('https://api.clerk.com/v1/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: [user.email],
          password: user.password,
          first_name: user.name.split(' ')[0] || user.name,
          last_name: user.name.split(' ').slice(1).join(' ') || '',
          unsafe_metadata: {
            role: user.role
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Clerk API error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  };

  const handleSingleUserCreation = async () => {
    if (!validateSecretKey()) return;
    
    if (!singleUser.name || !singleUser.email || !singleUser.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    const success = await createUser(singleUser);
    
    if (success) {
      toast({
        title: "User Created Successfully",
        description: `User ${singleUser.email} has been created with role ${singleUser.role}`,
      });
      setSingleUser({ name: '', email: '', password: '', role: 'bidder' });
    } else {
      toast({
        title: "Error Creating User",
        description: "Failed to create user. Please check the details and try again.",
        variant: "destructive",
      });
    }
    
    setIsCreating(false);
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

  const handleBulkUpload = async () => {
    if (!validateSecretKey()) return;
    
    if (bulkUsers.length === 0) {
      toast({
        title: "No Users to Create",
        description: "Please parse the CSV data first",
        variant: "destructive",
      });
      return;
    }

    setIsBulkUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const user of bulkUsers) {
      const success = await createUser(user);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    toast({
      title: "Bulk Upload Complete",
      description: `Created ${successCount} users successfully. ${errorCount} failed.`,
      variant: errorCount > 0 ? "destructive" : "default",
    });

    setBulkUsers([]);
    setCsvText('');
    setIsBulkUploading(false);
  };

  const downloadTemplate = () => {
    const csvContent = "name,email,password,role\nJohn Doe,john@example.com,Password123!,bidder\nJane Admin,jane@example.com,AdminPass456!,admin";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Create individual users or bulk upload multiple users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showSecretDialog} onOpenChange={setShowSecretDialog}>
            <DialogTrigger asChild>
              <Button className="w-full mb-4">
                Setup Clerk Secret Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enter Clerk Secret Key</DialogTitle>
                <DialogDescription>
                  You need to provide your Clerk secret key to create users via API
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

          {secretKey && (
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single User</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
              </TabsList>
              
              <TabsContent value="single" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={singleUser.name}
                      onChange={(e) => setSingleUser({...singleUser, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={singleUser.email}
                      onChange={(e) => setSingleUser({...singleUser, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={singleUser.password}
                      onChange={(e) => setSingleUser({...singleUser, password: e.target.value})}
                      placeholder="Strong password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={singleUser.role} onValueChange={(value: 'admin' | 'bidder') => setSingleUser({...singleUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bidder">Bidder</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleSingleUserCreation}
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="bulk" className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
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
                  <Label htmlFor="csv-data">CSV Data</Label>
                  <Textarea
                    id="csv-data"
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="name,email,password,role&#10;John Doe,john@example.com,Password123!,bidder&#10;Jane Admin,jane@example.com,AdminPass456!,admin"
                    rows={6}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Format: name,email,password,role (one user per line)
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={parseCsvText}>
                    Parse CSV
                  </Button>
                  <Button 
                    onClick={handleBulkUpload}
                    disabled={isBulkUploading || bulkUsers.length === 0}
                    className="flex-1"
                  >
                    {isBulkUploading ? 'Uploading...' : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {bulkUsers.length} Users
                      </>
                    )}
                  </Button>
                </div>

                {bulkUsers.length > 0 && (
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Users to Create ({bulkUsers.length})</h4>
                    <div className="max-h-40 overflow-y-auto">
                      {bulkUsers.map((user, index) => (
                        <div key={index} className="text-sm py-1 border-b last:border-b-0">
                          {user.name} ({user.email}) - {user.role}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCreation;
