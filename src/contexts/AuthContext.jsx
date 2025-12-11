import { createContext, useContext, useState } from "react";

// 1. Create Context
const AuthContext = createContext(null);

// 2. Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  function login(name) {
    // mock login – just save the name
    setUser({ name });
  }

  function logout() {
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: user !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Custom hook (easy usage)
export function useAuth() {
  return useContext(AuthContext);
}
