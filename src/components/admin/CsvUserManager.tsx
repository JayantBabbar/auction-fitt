
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'bidder';
}

interface CsvUserManagerProps {
  users: User[];
  setUsers: (users: User[]) => void;
  csvText: string;
  setCsvText: (text: string) => void;
}

const CsvUserManager: React.FC<CsvUserManagerProps> = ({
  users,
  setUsers,
  csvText,
  setCsvText
}) => {
  const { toast } = useToast();
  const [defaultRole, setDefaultRole] = useState<'admin' | 'bidder'>('bidder');
  const [defaultPassword, setDefaultPassword] = useState('TempPassword123!');

  const validateEmailDomain = (email: string): boolean => {
    return email.toLowerCase().endsWith('@fitt-iitd.in');
  };

  const parseCsvText = () => {
    const lines = csvText.trim().split('\n');
    const validUsers: User[] = [];
    const invalidEmails: string[] = [];
    
    lines.forEach((line, index) => {
      const [name, email, password, role] = line.split(',').map(item => item.trim());
      
      if (name && email) {
        if (!validateEmailDomain(email)) {
          invalidEmails.push(`Line ${index + 1}: ${email}`);
          return;
        }

        validUsers.push({
          name,
          email: email.toLowerCase(),
          password: password || defaultPassword,
          role: (role as 'admin' | 'bidder') || defaultRole
        });
      }
    });

    if (invalidEmails.length > 0) {
      toast({
        title: "Invalid Email Addresses",
        description: `The following emails don't end with @fitt-iitd.in:\n${invalidEmails.join('\n')}`,
        variant: "destructive",
        duration: 8000,
      });
    }
    
    setUsers(validUsers);
    
    if (validUsers.length > 0) {
      toast({
        title: "CSV Parsed Successfully",
        description: `Found ${validUsers.length} valid users to create${invalidEmails.length > 0 ? ` (${invalidEmails.length} invalid emails skipped)` : ''}`,
      });
    }
  };

  const downloadTemplate = () => {
    const csvContent = "name,email,password,role\nJohn Doe,john@fitt-iitd.in,Password123!,bidder\nJane Admin,jane@fitt-iitd.in,AdminPass456!,admin";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const loadExistingUserList = () => {
    const existingUsersCsv = `Admin User,admin@fitt-iitd.in,admin123,admin
Abhishek,abhishek@fitt-iitd.in,J5b|>)Vdn\\cj,bidder
Test Bidder 1,bidder1@fitt-iitd.in,password123,bidder
Test Bidder 2,bidder2@fitt-iitd.in,password123,bidder`;
    
    setCsvText(existingUsersCsv);
    toast({
      title: "User List Loaded",
      description: "Sample user list has been loaded. You can modify it as needed.",
    });
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Email Restriction:</strong> Only email addresses ending with @fitt-iitd.in will be accepted. Invalid emails will be automatically filtered out.
        </AlertDescription>
      </Alert>

      <div className="flex gap-2 mb-4">
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
        <Button variant="outline" onClick={loadExistingUserList}>
          <Upload className="h-4 w-4 mr-2" />
          Load Sample User List
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
          placeholder="name,email,password,role&#10;John Doe,john@fitt-iitd.in,Password123!,bidder&#10;Jane Admin,jane@fitt-iitd.in,AdminPass456!,admin"
          rows={8}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Format: name,email,password,role (one user per line). Email must end with @fitt-iitd.in
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={parseCsvText} disabled={!csvText.trim()}>
          Parse CSV
        </Button>
      </div>
    </div>
  );
};

export default CsvUserManager;
