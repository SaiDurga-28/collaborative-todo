import { createContext, useContext, useState, useEffect } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Apply theme to document body
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  const value = {
    theme,
    toggleTheme,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  return useContext(UIContext);
}
