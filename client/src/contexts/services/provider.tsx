import { useState, useMemo, useEffect, type ReactNode } from "react";
import { ServicesContext, type ServicesContextType } from "./context";
import { bootServices, disposeServices, services } from "../../services";

export const ServicesProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    bootServices()
      .then(() => setIsInitialized(true))
      .catch((err) => setError(err));

    return () => {
      disposeServices();
    };
  }, []);

  const contextValue: ServicesContextType = useMemo(
    () => ({
      isInitialized,
      error,
      services,
    }),
    [isInitialized, error]
  );

  return (
    <ServicesContext.Provider value={contextValue}>
      {children}
    </ServicesContext.Provider>
  );
};
