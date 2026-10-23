"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import BrandLogo from "./BrandLogo";

const items = [
  { label: "Home", href: "/", icon: <><path d="m3 10 9-7 9 7"/><path d="M5 9.5V20h14V9.5"/><path d="M9 20v-6h6v6"/></> },
  { label: "Search", href: "/search", icon: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></> },
  { label: "Explore", href: "/explore", icon: <><circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.5 5.1-5.1 2.5 2.5-5.1 5.1-2.5Z"/></> },
  { label: "Trending", href: "/trending", icon: <><path d="M12.2 21c4 0 6.8-2.8 6.8-6.6 0-2.5-1.3-4.5-3.8-6.7.1 2.2-.7 3.2-1.8 3.8C13.5 7.4 11 4.8 8 3c.7 4.4-3 6.6-3 11.2C5 18.3 8 21 12.2 21Z"/><path d="M12 21c-1.8-.8-2.7-2.1-2.7-3.8 0-1.4.8-2.5 2.2-3.6.1 1.3.6 2 1.5 2.5.8 1.9.4 3.6-1 4.9Z"/></> },
  { label: "About", href: "/about", icon: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.8h.01"/></> },
];

function NavIcon({ children }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = router.asPath.split("?")[0];
  const activeIndex = Math.max(0, items.findIndex((item) => item.href === pathname));
  return (
    <>
      <nav className="floating-news-nav" aria-label="Main navigation">
        <Link href="/" className="floating-news-nav__brand" aria-label="Nexa News home"><BrandLogo className="floating-news-nav__logo"/><span>Nexa News</span></Link>
        <div className="floating-news-nav__items" style={{ "--active-index": activeIndex }}>
          <span className="floating-news-nav__indicator" aria-hidden="true" />
          {items.map((item, index) => {
            const selected = item.href === pathname;
            return <Link key={item.href} href={item.href} className={`floating-news-nav__item${selected ? " is-active" : ""}`} aria-current={selected ? "page" : undefined}>
              <span className="floating-news-nav__icon"><NavIcon>{item.icon}</NavIcon></span><span className="floating-news-nav__label">{item.label}</span>
            </Link>;
          })}
        </div>
      </nav>
    </>
  );
}
