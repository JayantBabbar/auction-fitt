
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import Index from "@/pages/Index";
import CreateAuction from "@/pages/CreateAuction";
import AdminAuctionView from "@/pages/AdminAuctionView";

function App() {
  return (
    <SupabaseAuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/create-auction" element={<CreateAuction />} />
        <Route path="/admin/auction/:id" element={<AdminAuctionView />} />
      </Routes>
      <Toaster />
    </SupabaseAuthProvider>
  );
}

export default App;
