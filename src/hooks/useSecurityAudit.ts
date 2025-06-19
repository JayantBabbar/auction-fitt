
import { useMutation } from '@tanstack/react-query';

interface SecurityEvent {
  action: string;
  resourceType: string;
  resourceId?: string;
  success?: boolean;
  errorMessage?: string;
}

export const useSecurityAudit = () => {
  return useMutation({
    mutationFn: async (event: SecurityEvent) => {
      // Mock security logging since we're not using Supabase
      console.log('Security event logged:', {
        action: event.action,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        success: event.success ?? true,
        errorMessage: event.errorMessage,
        timestamp: new Date().toISOString()
      });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
    },
  });
};
