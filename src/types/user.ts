
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'bidder';
  name: string;
  password_reset_required?: boolean;
}

export interface AuthContextType {
  user: User | null;
  profile: User | null;
  isLoading: boolean;
  signOut: () => void;
}
