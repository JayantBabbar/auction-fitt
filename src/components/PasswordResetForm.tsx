
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SecurityAlert } from '@/components/SecurityAlert';

const PasswordResetForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
      requirements: {
        minLength,
        hasUppercase,
        hasLowercase,
        hasNumber,
        hasSpecialChar
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast({
        title: "Password Requirements Not Met",
        description: "Please ensure your password meets all security requirements.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      // Update password_reset_required to false
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ password_reset_required: false })
          .eq('id', user.id);

        // Log security event
        await supabase.rpc('log_security_event', {
          p_user_id: user.id,
          p_action: 'password_reset_completed',
          p_resource_type: 'auth',
          p_success: true
        });
      }

      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully. You will be logged out to use your new password.",
      });

      // Logout to force re-login with new password
      setTimeout(() => {
        logout();
      }, 2000);

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validation = validatePassword(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Your account requires a password reset. Please create a new secure password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SecurityAlert
            type="info"
            title="Security Notice"
            message="For your security, you must create a new password before accessing the system."
            className="mb-6"
          />
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your new password"
              />
            </div>

            <div className="text-sm space-y-1">
              <p className="font-medium">Password Requirements:</p>
              <ul className="space-y-1">
                <li className={validation.requirements.minLength ? 'text-green-600' : 'text-gray-500'}>
                  ✓ At least 8 characters
                </li>
                <li className={validation.requirements.hasUppercase ? 'text-green-600' : 'text-gray-500'}>
                  ✓ One uppercase letter
                </li>
                <li className={validation.requirements.hasLowercase ? 'text-green-600' : 'text-gray-500'}>
                  ✓ One lowercase letter
                </li>
                <li className={validation.requirements.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                  ✓ One number
                </li>
                <li className={validation.requirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}>
                  ✓ One special character
                </li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !validation.isValid || password !== confirmPassword}
            >
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordResetForm;
