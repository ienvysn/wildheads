import React, { createContext, useContext, useEffect } from "react";
import { authApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store";

interface AuthContextType {
  user: any;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setTokens,
    logout: logoutStore,
    setLoading,
    accessToken
  } = useAuthStore();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken) {
        try {
          const response = await authApi.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          logoutStore();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const response = await authApi.login({ username, password });

      // Store tokens in Zustand
      setTokens(response.data.access, response.data.refresh);

      // Also store in localStorage for API interceptor
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      // Fetch user profile
      const profileResponse = await authApi.getProfile();
      setUser(profileResponse.data);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${profileResponse.data.first_name || profileResponse.data.username}!`,
      });
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: error.response?.data?.detail || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutStore();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export type { AuthContextType };
export type UserRole = "admin" | "doctor" | "nurse" | "patient";
