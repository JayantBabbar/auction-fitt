
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Users, Download, FileText } from 'lucide-react';

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
    if (!csvText.trim()) {
      toast({
        title: "No Data to Parse",
        description: "Please enter CSV data first",
        variant: "destructive",
      });
      return;
    }

    console.log('Parsing CSV with length:', csvText.length);
    
    const lines = csvText.trim().split('\n').filter(line => line.trim());
    const parsedUsers: User[] = [];
    let skippedLines = 0;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        skippedLines++;
        return;
      }

      // Split by comma and clean up each field
      const parts = trimmedLine.split(',').map(item => item.trim());
      const [name, email, password, role] = parts;
      
      if (name && email) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          console.warn(`Invalid email format on line ${index + 1}: ${email}`);
          skippedLines++;
          return;
        }

        parsedUsers.push({
          name: name,
          email: email.toLowerCase(),
          password: password || defaultPassword,
          role: (role as 'admin' | 'bidder') || defaultRole
        });
      } else {
        console.warn(`Incomplete data on line ${index + 1}: missing name or email`);
        skippedLines++;
      }
    });
    
    console.log(`Parsed ${parsedUsers.length} users, skipped ${skippedLines} lines`);
    
    setUsers(parsedUsers);
    toast({
      title: "CSV Parsed Successfully",
      description: `Found ${parsedUsers.length} valid users to create${skippedLines > 0 ? ` (${skippedLines} lines skipped)` : ''}`,
    });
  };

  const generateSampleUsers = () => {
    const sampleData = [];
    for (let i = 1; i <= 10; i++) {
      sampleData.push(`Sample User ${i},sampleuser${i}@fitt-iitd.in,${defaultPassword},bidder`);
    }
    setCsvText(sampleData.join('\n'));
    toast({
      title: "Sample Data Generated",
      description: "Generated 10 sample users. You can modify this data before parsing.",
    });
  };

  const loadExistingUsers = () => {
    // Load the actual user data from the uploaded list
    const existingUsersData = `Abhishek,Abhishek@fitt-iitd.in,${defaultPassword},bidder
Adarsh Madhu,adarshmadhu@fitt-iitd.in,${defaultPassword},bidder
Aishwarya Shah,aishwaryashah@fitt-iitd.in,${defaultPassword},bidder
Akash Rana,Akashrana@fitt-iitd.in,${defaultPassword},bidder
Akash Shiroya,akashshiroya@fitt-iitd.in,${defaultPassword},bidder
Akshit Gupta,akshitgupta@fitt-iitd.in,${defaultPassword},bidder
Ankit Saxena,ankit@fitt-iitd.in,${defaultPassword},bidder
Anmol Chaturvedi,anmolchaturvedi@fitt-iitd.in,${defaultPassword},bidder
Anubhav Sen,anubhavsen@fitt-iitd.in,${defaultPassword},bidder
Arabinda Mitra,arabindamitra@fitt-iitd.in,${defaultPassword},bidder`;
    
    setCsvText(existingUsersData);
    toast({
      title: "User Data Loaded",
      description: "Loaded existing user data. Parse the CSV to create users.",
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
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
        <Button variant="outline" onClick={generateSampleUsers}>
          <Users className="h-4 w-4 mr-2" />
          Generate Sample Users
        </Button>
        <Button variant="outline" onClick={loadExistingUsers}>
          <FileText className="h-4 w-4 mr-2" />
          Load Existing User List
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
          Format: name,email,password,role (one user per line). Use the buttons above to get started.
        </p>
      </div>

      <Button 
        variant="outline" 
        onClick={parseCsvText}
        disabled={!csvText.trim()}
        className="w-full"
      >
        Parse CSV Data ({csvText.trim().split('\n').filter(line => line.trim()).length} lines)
      </Button>
    </div>
  );
};

export default CsvUserManager;
