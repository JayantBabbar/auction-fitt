
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.rpc('log_security_event', {
        p_user_id: user?.id || null,
        p_action: event.action,
        p_resource_type: event.resourceType,
        p_resource_id: event.resourceId || null,
        p_success: event.success ?? true,
        p_error_message: event.errorMessage || null
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    },
  });
};
