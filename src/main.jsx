import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { TodosProvider } from "./contexts/TodosContext.jsx";
import { UIProvider } from "./contexts/UIContext.jsx";
import { CollaborationProvider } from "./contexts/CollaborationContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
  <UIProvider>
    <CollaborationProvider>
          <TodosProvider>
            <App />
          </TodosProvider>
        </CollaborationProvider>
  </UIProvider>
</AuthProvider>
  </StrictMode>,
)
