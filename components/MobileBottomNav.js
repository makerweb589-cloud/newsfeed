import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import BrandLogo from "./BrandLogo";

const items = [
 {label:"Home",href:"/",icon:<><path d="m3 10 9-7 9 7"/><path d="M5 9.5V20h14V9.5"/><path d="M9 20v-6h6v6"/></>},
 {label:"Search",href:"/search",icon:<><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>},
 {label:"Explore",href:"/explore",icon:<><circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.5 5.1-5.1 2.5 2.5-5.1 5.1-2.5Z"/></>},
 {label:"Trending",href:"/trending",icon:<><path d="M12.2 21c4 0 6.8-2.8 6.8-6.6 0-2.5-1.3-4.5-3.8-6.7.1 2.2-.7 3.2-1.8 3.8C13.5 7.4 11 4.8 8 3c.7 4.4-3 6.6-3 11.2C5 18.3 8 21 12.2 21Z"/></>},
 {label:"About",href:"/about",icon:<><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.8h.01"/></>},
];
const desktopItems = [...items,
 {label:"World news",href:"/explore?topic=World",icon:<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>},
 {label:"Technology",href:"/explore?topic=Technology",icon:<><rect x="4" y="5" width="16" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></>},
 {label:"Business",href:"/explore?topic=Business",icon:<><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></>},
 {label:"Science",href:"/explore?topic=Science",icon:<><path d="M9 3h6M10 3v6l-5.2 8.1A2.5 2.5 0 0 0 6.9 21h10.2a2.5 2.5 0 0 0 2.1-3.9L14 9V3"/><path d="M8 15h8"/></>},
];
function Icon({children}) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>; }
function active(item,path) { const href=item.href.split("?")[0]; return href==="/" ? path==="/" : path===href; }

export default function MobileBottomNav() {
 const router=useRouter(), path=(router.asPath||"/").split("?")[0];
 const [expanded,setExpanded]=useState(true);
 useEffect(()=>{
  const sync=()=>{document.body.classList.toggle("desktop-nav-expanded",innerWidth>768&&expanded);document.body.classList.toggle("desktop-nav-collapsed",innerWidth>768&&!expanded);};
  sync();addEventListener("resize",sync,{passive:true});
  return ()=>{removeEventListener("resize",sync);document.body.classList.remove("desktop-nav-expanded","desktop-nav-collapsed");};
 },[expanded]);
 return <>
  <aside className={`nexa-glass-drawer ${expanded?"is-expanded":"is-collapsed"}`} aria-label="Desktop navigation">
   <div className="nexa-drawer-brand-row">
    <Link href="/" className="nexa-drawer-brand" aria-label="Nexa News home"><BrandLogo className="nexa-drawer-logo"/>{expanded&&<span className="nexa-drawer-brand-name">Nexa <b>News</b></span>}</Link>
    <button type="button" className="nexa-drawer-toggle" onClick={()=>setExpanded(v=>!v)} aria-label={expanded?"Collapse navigation":"Expand navigation"}><Icon>{expanded?<path d="m14 5-7 7 7 7M20 5l-7 7 7 7"/>:<path d="m10 5 7 7-7 7M4 5l7 7-7 7"/>}</Icon></button>
   </div>
   {expanded&&<div className="nexa-drawer-caption">DISCOVER NEXA</div>}
   <nav className="nexa-drawer-items" aria-label="Main navigation">{desktopItems.map(item=>{const selected=active(item,path);return <Link key={item.label} href={item.href} title={!expanded?item.label:undefined} className={`nexa-drawer-item${selected?" is-active":""}`} aria-current={selected?"page":undefined}><span className="nexa-drawer-icon"><Icon>{item.icon}</Icon></span>{expanded&&<span className="nexa-drawer-label">{item.label}</span>}{expanded&&selected&&<span className="nexa-drawer-active-dot"/>}</Link>;})}</nav>
   {expanded&&<div className="nexa-drawer-footer"><span className="nexa-drawer-live-dot"/>Headlines, in focus.</div>}
  </aside>
  <nav className="floating-news-nav" aria-label="Mobile navigation"><div className="floating-news-nav__items" style={{"--active-index":Math.max(0,items.findIndex(item=>active(item,path)))}}><span className="floating-news-nav__indicator" aria-hidden="true"/>{items.map(item=>{const selected=active(item,path);return <Link key={item.href} href={item.href} className={`floating-news-nav__item${selected?" is-active":""}`} aria-current={selected?"page":undefined}><span className="floating-news-nav__icon"><Icon>{item.icon}</Icon></span><span className="floating-news-nav__label">{item.label}</span></Link>;})}</div></nav>
 </>;
}
