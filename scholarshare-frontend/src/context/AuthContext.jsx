import { useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Only worth showing a loading state if a token is already stored
  // and needs to be verified; otherwise there's nothing to wait for.
  const [isLoading, setIsLoading] = useState(() => Boolean(authService.getToken()));

  // On first load, if a token is already stored, try to resolve who
  // it belongs to. Fails quietly if there's no backend to ask yet.
  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      return;
    }

    let cancelled = false;

    authService
      .fetchCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => authService.logout())
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user ?? null);
    return data;
  };

  const register = async (details) => {
    const data = await authService.register(details);
    setUser(data.user ?? null);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
