import { useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { AUTH_EVENTS } from "../config/constants";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True after the user pressed "Sign out" (as opposed to a token expiring), so
  // ProtectedRoute can send them home instead of to the login page.
  const [hasSignedOut, setHasSignedOut] = useState(false);
  // Only show a loading state when a stored token still has to be verified.
  const [isLoading, setIsLoading] = useState(() => Boolean(authService.getToken()));

  // On first load, if a token is stored, find out who it belongs to.
  useEffect(() => {
    if (!authService.getToken()) return;

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

  // httpClient fires this when the backend rejects the token (401).
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener(AUTH_EVENTS.unauthorized, handleUnauthorized);
    return () => window.removeEventListener(AUTH_EVENTS.unauthorized, handleUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    const signedInUser = await authService.login(credentials);
    setUser(signedInUser);
    setHasSignedOut(false);
    return signedInUser;
  }, []);

  // Registering does not sign anyone in: the account stays PENDING until an admin approves it.
  const register = useCallback((details) => authService.register(details), []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setHasSignedOut(true);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      hasSignedOut,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      setUser, // used by the profile page after the name/picture is saved
    }),
    [user, isLoading, hasSignedOut, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
