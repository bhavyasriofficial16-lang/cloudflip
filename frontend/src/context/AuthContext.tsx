import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "../api/supabaseClient";
import { 
  auth as firebaseAuth, 
  isFirebaseConfigured, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "../api/firebaseClient";

export type AuthUser = {
  uid: string;
  email: string | null;
  provider: "firebase" | "supabase" | "demo";
};

type AuthContextValue = {
  user: AuthUser | null;
  session: any | null;
  loading: boolean;
  configured: boolean;
  authProvider: "firebase" | "supabase" | "demo";
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const activeProvider = isFirebaseConfigured ? "firebase" : (isSupabaseConfigured ? "supabase" : "demo");

  useEffect(() => {
    if (isFirebaseConfigured && firebaseAuth) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          setUser({ uid: fbUser.uid, email: fbUser.email, provider: "firebase" });
          setSession({ user: { email: fbUser.email, id: fbUser.uid } });
        } else {
          setUser(null);
          setSession(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        if (data.session?.user) {
          setUser({ uid: data.session.user.id, email: data.session.user.email || null, provider: "supabase" });
        }
        setLoading(false);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
        setSession(s);
        if (s?.user) {
          setUser({ uid: s.user.id, email: s.user.email || null, provider: "supabase" });
        } else {
          setUser(null);
        }
      });
      return () => sub.subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string) => {
    if (isFirebaseConfigured && firebaseAuth) {
      try {
        const res = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        setUser({ uid: res.user.uid, email: res.user.email, provider: "firebase" });
        setSession({ user: { email: res.user.email, id: res.user.uid } });
        return { error: null };
      } catch (err: any) {
        return { error: err.message || "Failed to create Firebase account." };
      }
    } else if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error?.message ?? null };
    }
    // Demo fallback sign-up
    setUser({ uid: "demo-user-123", email, provider: "demo" });
    setSession({ user: { email, id: "demo-user-123" } });
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (isFirebaseConfigured && firebaseAuth) {
      try {
        const res = await signInWithEmailAndPassword(firebaseAuth, email, password);
        setUser({ uid: res.user.uid, email: res.user.email, provider: "firebase" });
        setSession({ user: { email: res.user.email, id: res.user.uid } });
        return { error: null };
      } catch (err: any) {
        return { error: err.message || "Failed to log in via Firebase." };
      }
    } else if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    }
    // Demo fallback sign-in
    setUser({ uid: "demo-user-123", email, provider: "demo" });
    setSession({ user: { email, id: "demo-user-123" } });
    return { error: null };
  };

  const signOut = async () => {
    if (isFirebaseConfigured && firebaseAuth) {
      await firebaseSignOut(firebaseAuth);
    } else if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        loading, 
        configured: isFirebaseConfigured || isSupabaseConfigured, 
        authProvider: activeProvider,
        signUp, 
        signIn, 
        signOut 
      }}
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
