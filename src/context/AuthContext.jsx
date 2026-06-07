import axios from "axios";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "lieDetectorToken";
const AuthContext = createContext(null);

function getStoredToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

function getInitials(user) {
  const name = user?.name || user?.email || "";
  return name
    .split(user?.name ? " " : "@")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalizeUser(user) {
  if (!user) return null;

  return {
    ...user,
    fullName: user.name,
    initials: getInitials(user),
  };
}

function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === "ERR_NETWORK") return "Backend server unavailable. Please start the backend and try again.";
  return error.message || "Something went wrong. Please try again.";
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getStoredToken()));

  const saveSession = useCallback((nextToken, nextUser) => {
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(normalizeUser(nextUser));
  }, []);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
  }, []);

  const fetchMe = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      const response = await apiClient.get("/api/auth/me");
      setToken(storedToken);
      setUser(normalizeUser(response.data.user));
      return response.data.user;
    } catch {
      clearSession();
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const register = async ({ fullName, email, password }) => {
    try {
      const response = await apiClient.post("/api/auth/register", {
        name: fullName,
        email,
        password,
      });
      saveSession(response.data.token, response.data.user);
      return response.data.user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const login = async ({ email, password }) => {
    try {
      const response = await apiClient.post("/api/auth/login", { email, password });
      saveSession(response.data.token, response.data.user);
      return response.data.user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const logout = async () => {
    try {
      if (getStoredToken()) {
        await apiClient.post("/api/auth/logout");
      }
    } catch {
      // Frontend logout should still clear a stale or expired token.
    } finally {
      clearSession();
    }
  };

  const refreshUser = async () => fetchMe();

  const updateUser = (updates) => {
    setUser((current) => normalizeUser({ ...current, ...updates }));
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      isLoggedIn: Boolean(user && token),
      plan: user?.plan || "free",
      attempts: user?.attemptsLeft || 0,
      videoEnabled: Boolean(user?.videoEnabled),
      register,
      signup: register,
      login,
      logout,
      fetchMe,
      refreshUser,
      updateUser,
    }),
    [user, token, loading, fetchMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
