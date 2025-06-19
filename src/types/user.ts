
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'bidder';
  name: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => void;
}
