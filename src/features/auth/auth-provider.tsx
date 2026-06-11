import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import type { User, Role } from "@/types/database";

interface AuthState {
  session: Session | null;
  user: User | null;
  roles: Role[];
  isAdmin: boolean;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!userData) {
      setUser(null);
      setRoles([]);
      return;
    }

    setUser(userData);

    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role_id, roles(id, name, label)")
      .eq("user_id", userId);

    if (userRoles) {
      const roleList = userRoles
        .map((ur) => (ur as unknown as { roles: Role }).roles)
        .filter(Boolean);
      setRoles(roleList);
    } else {
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        fetchProfile(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        setLoading(true);
        fetchProfile(s.user.id).finally(() => setLoading(false));
      } else {
        setUser(null);
        setRoles([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRoles([]);
    setSession(null);
  };

  const isAdmin = roles.some((r) => r.name === "admin");

  return (
    <AuthContext.Provider
      value={{ session, user, roles, isAdmin, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
