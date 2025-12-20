import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const CollaborationContext = createContext(null);

export function CollaborationProvider({ children }) {
  const [activityLog, setActivityLog] = useState([]);


  const addActivity = useCallback((message) => {
    const entry = {
      id: crypto.randomUUID(),
      message,
      time: new Date().toLocaleTimeString(),
    };

    setActivityLog((prev) => [entry, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      activityLog,
      addActivity,
    }),
    [activityLog, addActivity]
  );

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  return useContext(CollaborationContext);
}
