
import { Toaster } from "@/components/ui/toaster";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import Index from "@/pages/Index";

function App() {
  return (
    <SupabaseAuthProvider>
      <Index />
      <Toaster />
    </SupabaseAuthProvider>
  );
}

export default App;
