
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, UserPlus, Users, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserManagement } from '@/hooks/useUserManagement';

interface User {
  name: string;
  email: string;
  role: 'admin' | 'bidder';
}

const UserCreation = () => {
  const { toast } = useToast();
  const { createUser, createBulkUsers, isCreating } = useUserManagement();
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  
  // Single user creation state
  const [singleUser, setSingleUser] = useState<User>({
    name: '',
    email: '',
    role: 'bidder'
  });

  // Bulk upload state
  const [bulkUsers, setBulkUsers] = useState<User[]>([]);
  const [csvText, setCsvText] = useState('');
  const [defaultRole, setDefaultRole] = useState<'admin' | 'bidder'>('bidder');

  const handleSingleUserCreation = async () => {
    if (!singleUser.name || !singleUser.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const success = await createUser(singleUser);
    
    if (success) {
      setSingleUser({ name: '', email: '', role: 'bidder' });
    }
  };

  const parseCsvText = () => {
    const lines = csvText.trim().split('\n');
    const users: User[] = [];
    
    lines.forEach((line, index) => {
      const [name, email, role] = line.split(',').map(item => item.trim());
      
      if (name && email) {
        users.push({
          name,
          email,
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
    if (bulkUsers.length === 0) {
      toast({
        title: "No Users to Create",
        description: "Please parse the CSV data first",
        variant: "destructive",
      });
      return;
    }

    setIsBulkUploading(true);
    const successCount = await createBulkUsers(bulkUsers);

    toast({
      title: "Bulk Upload Complete",
      description: `Created ${successCount} out of ${bulkUsers.length} users successfully.`,
      variant: successCount === bulkUsers.length ? "default" : "destructive",
    });

    setBulkUsers([]);
    setCsvText('');
    setIsBulkUploading(false);
  };

  const downloadTemplate = () => {
    const csvContent = "name,email,role\nJohn Doe,john@fitt-iitd.in,bidder\nJane Admin,jane@fitt-iitd.in,admin";
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
            Create individual users or bulk upload multiple users. All users will need to reset their passwords on first login.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    placeholder="john@fitt-iitd.in"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be @fitt-iitd.in domain
                  </p>
                </div>
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
                <Label htmlFor="csv-data">CSV Data</Label>
                <Textarea
                  id="csv-data"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="name,email,role&#10;John Doe,john@fitt-iitd.in,bidder&#10;Jane Admin,jane@fitt-iitd.in,admin"
                  rows={6}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Format: name,email,role (one user per line). Role is optional and will use default role if not specified.
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
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCreation;
