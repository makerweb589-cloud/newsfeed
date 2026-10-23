"use client";

import { useWebLogo } from "./AppProviders";

export default function BrandLogo({ className = "brand-icon", alt = "Nexa logo" }) {
  const logoUrl = useWebLogo();
  if (logoUrl) {
    return <img className={`${className} brand-image`} src={logoUrl} alt={alt} />;
  }
  return <span className={className} aria-label={alt}>N</span>;
}
