
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TempPassword {
  id: string;
  user_email: string;
  user_name: string;
  temporary_password: string;
  created_at: string;
  expires_at: string;
  password_used: boolean;
}

const TempPasswordManager = () => {
  const { toast } = useToast();
  const [visiblePasswords, setVisiblePasswords] = React.useState<Set<string>>(new Set());

  const { data: tempPasswords = [], isLoading, refetch } = useQuery({
    queryKey: ['temp-passwords'],
    queryFn: async () => {
      // Use rpc to call a function that returns temp passwords
      const { data, error } = await supabase.rpc('get_temp_passwords');
      
      if (error) {
        // If the function doesn't exist, try direct query with type assertion
        console.log('RPC function not found, trying direct query');
        const { data: directData, error: directError } = await (supabase as any)
          .from('temp_passwords')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (directError) throw directError;
        return directData as TempPassword[];
      }
      
      return data as TempPassword[];
    }
  });

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyPassword = (password: string, email: string) => {
    navigator.clipboard.writeText(password);
    toast({
      title: "Password Copied",
      description: `Temporary password for ${email} copied to clipboard`,
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Temporary Passwords</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Temporary Passwords
        </CardTitle>
        <CardDescription>
          Manage temporary passwords for admin-created users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tempPasswords.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No temporary passwords found
          </p>
        ) : (
          <div className="space-y-4">
            {tempPasswords.map((tempPass) => (
              <div key={tempPass.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{tempPass.user_name}</h4>
                    <p className="text-sm text-muted-foreground">{tempPass.user_email}</p>
                  </div>
                  <div className="flex gap-2">
                    {isExpired(tempPass.expires_at) && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                    {tempPass.password_used && (
                      <Badge variant="secondary">Used</Badge>
                    )}
                    {!isExpired(tempPass.expires_at) && !tempPass.password_used && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 bg-muted p-2 rounded font-mono text-sm">
                    {visiblePasswords.has(tempPass.id) 
                      ? tempPass.temporary_password 
                      : '••••••••••••'
                    }
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePasswordVisibility(tempPass.id)}
                  >
                    {visiblePasswords.has(tempPass.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyPassword(tempPass.temporary_password, tempPass.user_email)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2">
                  Created: {format(new Date(tempPass.created_at), 'PPp')} | 
                  Expires: {format(new Date(tempPass.expires_at), 'PPp')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TempPasswordManager;
