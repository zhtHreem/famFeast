import React, { createContext, useState, useContext } from 'react';

// Create Context
const LoginContext = createContext();

// Create Provider Component
export function LoginProvider({ children }) {
  const [isLoginOpen, setLoginOpen] = useState(false);

  return (
    <LoginContext.Provider value={{ isLoginOpen, setLoginOpen }}>
      {children}
    </LoginContext.Provider>
  );
}

// Custom hook to use login context
export function useLogin() {
  return useContext(LoginContext);
}
