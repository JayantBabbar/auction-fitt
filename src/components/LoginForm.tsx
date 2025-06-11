
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Login Failed",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }
    
    const success = await login(email, password);
    
    if (!success) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please check your credentials and try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-fintech-blue to-fintech-blue-light rounded-2xl shadow-lg">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
            AuctionTech
          </h1>
          <p className="text-fintech-gray text-lg font-medium">
            Enterprise Auction Platform
          </p>
        </div>

        <Card className="fintech-card fintech-shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-semibold text-foreground">Sign In</CardTitle>
            <CardDescription className="text-fintech-gray">
              Access your auction dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-background border-border focus:border-fintech-blue transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-background border-border focus:border-fintech-blue transition-colors"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 fintech-button text-white font-medium text-base" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            
            <div className="mt-8 p-5 bg-muted/30 rounded-xl border border-border/50">
              <p className="text-sm font-medium text-fintech-gray mb-3">Demo Admin Credentials:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-fintech-gray">Email:</span>
                  <span className="font-mono text-foreground">admin@auction.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fintech-gray">Password:</span>
                  <span className="font-mono text-foreground">admin123</span>
                </div>
              </div>
              <p className="text-xs text-fintech-gray-light mt-3">
                Use these credentials to access the platform demo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
