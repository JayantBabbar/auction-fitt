
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'bidder';
  name: string;
  passwordResetRequired?: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
