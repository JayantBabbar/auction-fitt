
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Gavel, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import PasswordResetForm from './PasswordResetForm';

const SupabaseLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [userNeedsPasswordReset, setUserNeedsPasswordReset] = useState(false);
  const { signIn, profile } = useSupabaseAuth();
  const { toast } = useToast();

  // Check if user needs password reset after successful login
  useEffect(() => {
    if (profile && profile.password_reset_required) {
      setShowPasswordReset(true);
      setUserNeedsPasswordReset(true);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Attempting login with:', { email, passwordLength: password.length });

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Login error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText
        });
        
        toast({
          title: "Login Failed",
          description: `${error.message} (Debug: Check console for details)`,
          variant: "destructive",
        });
      } else {
        console.log('Login successful');
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        // The useEffect will handle showing password reset if needed
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions.",
        });
        setShowForgotPassword(false);
      }
    } catch (error) {
      console.error('Unexpected password reset error:', error);
      toast({
        title: "Reset Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = (testEmail: string, testPassword: string) => {
    console.log('Setting test credentials:', { email: testEmail, passwordLength: testPassword.length });
    setEmail(testEmail);
    setPassword(testPassword);
  };

  const handlePasswordChanged = () => {
    setShowPasswordReset(false);
    setUserNeedsPasswordReset(false);
    toast({
      title: "Password Updated",
      description: "You can now access the application normally.",
    });
  };

  // Show password reset form if user needs to reset password
  if (showPasswordReset && userNeedsPasswordReset) {
    return <PasswordResetForm onPasswordChanged={handlePasswordChanged} />;
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary rounded-full">
                <Gavel className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl font-semibold text-foreground mb-2">
              Auction House
            </h1>
            <p className="text-muted-foreground">
              Reset your password
            </p>
          </div>

          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForgotPassword(false)}
                  className="p-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-2xl">
                  Forgot Password
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send you a link to reset your password
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Gavel className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-semibold text-foreground mb-2">
            Auction House
          </h1>
          <p className="text-muted-foreground">
            Premium bidding platform
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-sm"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3 text-center">Test Accounts:</p>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleTestLogin('admin@fitt-iitd.in', 'admin123')}
                >
                  Login as Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleTestLogin('Abhishek@fitt-iitd.in', 'J5b|>)Vdn\\cj')}
                >
                  Login as Bidder (Abhishek)
                </Button>
              </div>
            </div>

            {/* Debug info */}
            <div className="pt-2 text-xs text-gray-500">
              <p>Debug: Email confirmation should be disabled in Supabase settings</p>
              <p>Current email: {email}</p>
              <p>Password length: {password.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseLoginForm;
