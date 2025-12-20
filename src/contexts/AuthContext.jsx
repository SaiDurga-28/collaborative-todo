import { createContext, useContext, useState, useCallback, useMemo } from "react";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);


  const login = useCallback((name) => {
    setUser({ name });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);


  const value = useMemo(() => ({
    user,
    isAuthenticated: user !== null,
    login,
    logout,
  }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
