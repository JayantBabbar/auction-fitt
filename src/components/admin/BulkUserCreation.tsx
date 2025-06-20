
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
      description: "Generated 80 sample users. Use the export feature to create them.",
    });
  };

  const downloadCsvForClerk = () => {
    if (bulkUsers.length === 0) {
      toast({
        title: "No Users to Export",
        description: "Please parse the CSV data first",
        variant: "destructive",
      });
      return;
    }

    const csvHeader = "Email,First Name,Last Name,Password,Role\n";
    const csvContent = bulkUsers.map(user => {
      const [firstName, ...lastNameParts] = user.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      return `${user.email},"${firstName}","${lastName}",${user.password},${user.role}`;
    }).join('\n');
    
    const fullCsv = csvHeader + csvContent;
    const blob = new Blob([fullCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clerk_bulk_users.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Downloaded",
      description: "Import this file in your Clerk Dashboard under Users > Import users",
    });
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
            Create multiple users at once. Due to browser security restrictions, users must be created through Clerk Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Direct API calls to Clerk are blocked by browser security. 
              Use the export feature below to generate a CSV file that can be imported directly in your Clerk Dashboard.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
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
                onClick={downloadCsvForClerk}
                disabled={bulkUsers.length === 0}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Export for Clerk Import ({bulkUsers.length} users)
              </Button>
            </div>

            {bulkUsers.length > 0 && (
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Users to Export ({bulkUsers.length})</h4>
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
                How to Import Users in Clerk Dashboard:
              </h4>
              <ol className="text-sm space-y-1 text-muted-foreground">
                <li>1. Export your users using the button above</li>
                <li>2. Go to your Clerk Dashboard → Users section</li>
                <li>3. Click "Import users" button</li>
                <li>4. Upload the downloaded CSV file</li>
                <li>5. Review and confirm the import</li>
                <li>6. Users will be created with the specified roles in metadata</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUserCreation;
