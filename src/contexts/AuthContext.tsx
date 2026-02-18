import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getToken } from "@/services/api";
import {
  login as loginApi,
  signup as signupApi,
  logout as logoutApi,
  forgotPassword as forgotPasswordApi,
  resetPassword as resetPasswordApi,
  getMe,
  type User,
} from "@/services/authService";

export type AppRole = "customer" | "agent";

interface AuthContextType {
  user: User | null;
  role: AppRole;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (token: string, password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>("customer");
  const [loading, setLoading] = useState(true);

  // On mount, check if we have a token and fetch user
  useEffect(() => {
    const token = getToken();
    if (token) {
      getMe()
        .then((u) => {
          setUser(u);
          setRole(u.role);
        })
        .catch(() => {
          // Token invalid/expired
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const res = await signupApi(email, password, fullName);
      setUser(res.user);
      setRole(res.user.role);
      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await loginApi(email, password);
      setUser(res.user);
      setRole(res.user.role);
      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await logoutApi();
    setUser(null);
    setRole("customer");
  };

  const resetPassword = async (email: string) => {
    try {
      await forgotPasswordApi(email);
      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const updatePassword = async (token: string, password: string) => {
    try {
      await resetPasswordApi(token, password);
      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, signUp, signIn, signOut, resetPassword, updatePassword }}
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
