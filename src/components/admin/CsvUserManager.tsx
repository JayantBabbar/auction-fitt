
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Users, Download } from 'lucide-react';

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
  const [defaultPassword, setDefaultPassword] = useState('AuctionUser2024!');

  const parseCsvText = () => {
    const lines = csvText.trim().split('\n');
    const parsedUsers: User[] = [];
    
    lines.forEach((line, index) => {
      const [name, email, password, role] = line.split(',').map(item => item.trim());
      
      if (name && email) {
        parsedUsers.push({
          name,
          email,
          password: password || defaultPassword,
          role: (role as 'admin' | 'bidder') || defaultRole
        });
      }
    });
    
    setUsers(parsedUsers);
    toast({
      title: "CSV Parsed",
      description: `Found ${parsedUsers.length} users to create`,
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

      <Button variant="outline" onClick={parseCsvText}>
        Parse CSV ({csvText.trim().split('\n').filter(line => line.trim()).length} lines)
      </Button>
    </div>
  );
};

export default CsvUserManager;
