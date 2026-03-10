import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, login as loginRequest, signup as signupRequest } from "../lib/api";

const TOKEN_KEY = "app_logger_auth_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const me = await getMe(token);
        setUser(me);
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async ({ email, password }) => {
    const result = await loginRequest({ email, password });
    localStorage.setItem(TOKEN_KEY, result.authToken);
    setToken(result.authToken);
    const me = await getMe(result.authToken);
    setUser(me);
    return me;
  };

  const signup = async ({ name, email, password }) => {
    const result = await signupRequest({ name, email, password });
    localStorage.setItem(TOKEN_KEY, result.authToken);
    setToken(result.authToken);
    const me = await getMe(result.authToken);
    setUser(me);
    return me;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
    }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
