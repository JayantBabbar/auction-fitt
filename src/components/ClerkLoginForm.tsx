
import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel } from 'lucide-react';

const ClerkLoginForm = () => {
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
          <CardContent>
            <div className="flex justify-center">
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "shadow-none border-0 bg-transparent",
                    formButtonPrimary: "bg-primary hover:bg-primary/90",
                    footerAction: "hidden" // Hide the signup link
                  }
                }}
                signUpUrl={undefined} // Disable signup completely
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClerkLoginForm;
