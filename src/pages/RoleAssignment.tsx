
import React, { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import SupabaseLoginForm from '@/components/SupabaseLoginForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, User, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const RoleAssignment = () => {
  const { user, profile, isLoading } = useSupabaseAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'bidder'>('bidder');
  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user || !profile) {
    return <SupabaseLoginForm />;
  }

  const handleRoleUpdate = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      // Update the user's role in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Role Updated Successfully",
        description: `Your role has been set to ${selectedRole}. Please refresh the page to see changes.`,
      });

      // Force a page refresh to update the auth context
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const currentRole = profile?.role || 'bidder';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary rounded-full">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Role Assignment</CardTitle>
            <CardDescription>
              Set your role for testing purposes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-user">Current User</Label>
              <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-sm">{profile.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-role">Current Role</Label>
              <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                {currentRole === 'admin' ? (
                  <Crown className="h-4 w-4 text-yellow-600" />
                ) : (
                  <User className="h-4 w-4 text-blue-600" />
                )}
                <span className="text-sm capitalize font-medium">{currentRole}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-select">Select New Role</Label>
              <Select value={selectedRole} onValueChange={(value: 'admin' | 'bidder') => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bidder">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>Bidder</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleRoleUpdate}
              disabled={isUpdating || selectedRole === currentRole}
              className="w-full"
            >
              {isUpdating ? 'Updating...' : 'Update Role'}
            </Button>

            <div className="text-xs text-slate-500 text-center">
              <p>This is for testing purposes only.</p>
              <p>The page will refresh after role update.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleAssignment;
