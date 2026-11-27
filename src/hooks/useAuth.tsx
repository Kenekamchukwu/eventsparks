import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  loading: false,
  signIn: () => false,
  signOut: () => {},
});

const SESSION_KEY = "eventsparks_admin_session";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored === "true") setIsAdmin(true);
    setLoading(false);
  }, []);

  const signIn = (email: string, password: string): boolean => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      setIsAdmin(true);
      localStorage.setItem(SESSION_KEY, "true");
      return true;
    }
    return false;
  };

  const signOut = () => {
    setIsAdmin(false);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
