import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  loading: true,
  signIn: async () => false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let generation = 0;
    const checkRole = async (userId?: string) => {
      const current = ++generation;
      if (active) { setIsAdmin(false); setLoading(true); }
      if (!userId) {
        if (active && current === generation) setLoading(false);
        return;
      }
      const { data, error } = await supabase.from("user_roles")
        .select("id").eq("user_id", userId).eq("role", "admin").limit(1);
      if (active && current === generation) {
        setIsAdmin(!error && !!data?.length);
        setLoading(false);
      }
    };
    // Defer database queries until after the auth callback returns to avoid
    // waiting on Supabase's internal auth lock inside onAuthStateChange.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => { if (active) void checkRole(session?.user.id); }, 0);
    });
    return () => { active = false; generation++; subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;
    const { data: roles, error: roleError } = await supabase.from("user_roles")
      .select("id").eq("user_id", data.user.id).eq("role", "admin").limit(1);
    if (roleError || !roles?.length) {
      await supabase.auth.signOut();
      return false;
    }
    return true;
  };

  const signOut = async () => { await supabase.auth.signOut(); };
  return <AuthContext.Provider value={{ isAdmin, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
