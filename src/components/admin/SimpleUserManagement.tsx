
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Users, AlertCircle } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SimpleUserManagement = () => {
  const { createUser, isCreating } = useUserManagement();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'bidder' as 'admin' | 'bidder'
  });

  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    if (!email.endsWith('@fitt-iitd.in') && !email.endsWith('@aic-iitd.in')) {
      setEmailError('Only @fitt-iitd.in and @aic-iitd.in email addresses are allowed');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (email: string) => {
    setFormData({ ...formData, email });
    if (email) {
      validateEmail(email);
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      return;
    }

    if (!validateEmail(formData.email)) {
      return;
    }

    const success = await createUser(formData);
    
    if (success) {
      // Clear form on success
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'bidder'
      });
      setEmailError('');
    }
  };

  const createTestUsers = async () => {
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@fitt-iitd.in',
        password: 'admin123',
        role: 'admin' as const
      },
      {
        name: 'Abhishek',
        email: 'Abhishek@fitt-iitd.in',
        password: 'J5b|>)Vdn\\cj',
        role: 'bidder' as const
      }
    ];

    for (const user of testUsers) {
      await createUser(user);
      // Small delay between users
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
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
            Create new users for the auction platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Email Restriction:</strong> Only email addresses ending with @fitt-iitd.in or @aic-iitd.in are allowed for user creation.
            </AlertDescription>
          </Alert>

          {/* Quick test users button */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium mb-2">Quick Setup</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Create the test users that are referenced in the login form
            </p>
            <Button 
              onClick={createTestUsers}
              disabled={isCreating}
              variant="outline"
            >
              {isCreating ? 'Creating...' : 'Create Test Users'}
            </Button>
          </div>

          {/* Manual user creation form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="john@fitt-iitd.in or john@aic-iitd.in"
                  required
                  className={emailError ? 'border-red-500' : ''}
                />
                {emailError && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Must end with @fitt-iitd.in or @aic-iitd.in
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Strong password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: 'admin' | 'bidder') => setFormData({ ...formData, role: value })}
                >
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
              type="submit"
              disabled={isCreating || !formData.name || !formData.email || !formData.password || !!emailError}
              className="w-full"
            >
              {isCreating ? 'Creating...' : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleUserManagement;
