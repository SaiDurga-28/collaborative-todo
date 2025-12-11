import { createContext, useContext, useState } from "react";

const CollaborationContext = createContext(null);

export function CollaborationProvider({ children }) {
  const [activityLog, setActivityLog] = useState([]);

  function addActivity(message) {
    const entry = {
      id: crypto.randomUUID(),
      message,
      time: new Date().toLocaleTimeString(),
    };

    setActivityLog((prev) => [entry, ...prev]);
  }

  const value = {
    activityLog,
    addActivity,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  return useContext(CollaborationContext);
}
