
import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ClerkLoginForm = () => {
  const [isSignUp, setIsSignUp] = React.useState(false);

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
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              {isSignUp ? (
                <SignUp 
                  appearance={{
                    elements: {
                      rootBox: "mx-auto",
                      card: "shadow-none border-0 bg-transparent"
                    }
                  }}
                />
              ) : (
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: "mx-auto",
                      card: "shadow-none border-0 bg-transparent"
                    }
                  }}
                />
              )}
            </div>
            
            <div className="text-center mt-4">
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClerkLoginForm;
