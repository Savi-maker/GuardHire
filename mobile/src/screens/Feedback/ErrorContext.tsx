import React, { createContext, useContext, useState, useMemo } from 'react';

interface ErrorContextType {
  error: string | null;
  setError: (msg: string | null) => void;
}

const ErrorContext = createContext<ErrorContextType>({
  error: null,
  setError: () => {},
});

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);

  const contextValue = useMemo(() => ({ error, setError }), [error]);

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
