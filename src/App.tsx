
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimpleAuthProvider } from "@/contexts/SimpleAuthContext";
import SimpleIndex from "./pages/SimpleIndex";
import CreateAuction from "./pages/CreateAuction";
import RoleAssignment from "./pages/RoleAssignment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SimpleAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SimpleIndex />} />
            <Route path="/create-auction" element={<CreateAuction />} />
            <Route path="/admin-setup" element={<RoleAssignment />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SimpleAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
