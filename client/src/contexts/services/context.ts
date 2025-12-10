import { createContext, useContext } from "react";
import { type Services } from "../../services";

export interface ServicesContextType {
  isInitialized: boolean;
  error: Error | null;
  services: Services;
}

export const ServicesContext = createContext<ServicesContextType | undefined>(
  undefined
);

export const useServices = () => {
  const context = useContext(ServicesContext);

  if (context === undefined) {
    throw new Error("useServices must be used within ServicesProvider");
  }

  return context;
};
