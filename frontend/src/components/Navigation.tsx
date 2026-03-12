import { useState } from 'react';
import { createContext, useContext, ReactNode } from 'react';

type Page = 'home' | 'cart' | 'checkout' | 'tracking' | 'users';

interface NavigationContextType {
  currentPage: Page;
  navigate: (page: Page) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const navigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <NavigationContext.Provider value={{ currentPage, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigate() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigate must be used within NavigationProvider');
  }
  return context.navigate;
}

export function useCurrentPage() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useCurrentPage must be used within NavigationProvider');
  }
  return context.currentPage;
}
