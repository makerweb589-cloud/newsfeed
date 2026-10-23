"use client";

import { createContext, useContext } from "react";

const WebLogoContext = createContext("");

export function useWebLogo() {
  return useContext(WebLogoContext);
}

export default function AppProviders({ children, logoUrl = "" }) {
  return <WebLogoContext.Provider value={logoUrl}>{children}</WebLogoContext.Provider>;
}
