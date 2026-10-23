"use client";
import { useEffect } from "react";

const SELECTOR = ".story-card, .about-news-principle";
export default function EdgeGlowEffect() {
  useEffect(() => {
    const elements = new Set();
    let raf = 0, px = -10000, py = -10000;
    const proximity = 58;
    const scan = () => document.querySelectorAll(SELECTOR).forEach((el) => { if (!elements.has(el)) { elements.add(el); el.classList.add("edge-glow-target"); } });
    const update = () => {
      raf = 0; scan();
      for (const el of elements) {
        if (!el.isConnected) { elements.delete(el); continue; }
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const x = Math.max(r.left, Math.min(px, r.right));
        const y = Math.max(r.top, Math.min(py, r.bottom));
        const distance = Math.hypot(px - x, py - y);
        if (distance > proximity) { el.classList.remove("edge-glow-active"); continue; }
        // Project the pointer to the nearest point on the card edge; adjacent cards
        // therefore illuminate their own facing edges at the same time.
        // If the pointer is outside the rectangle, choose that facing edge first.
        // Only when the pointer is inside the card do we compare all four edges.
        let side;
        if (px < r.left) side = 3;
        else if (px > r.right) side = 1;
        else if (py < r.top) side = 0;
        else if (py > r.bottom) side = 2;
        else {
          const distances = [Math.abs(py-r.top), Math.abs(px-r.right), Math.abs(py-r.bottom), Math.abs(px-r.left)];
          side = distances.indexOf(Math.min(...distances));
        }
        let edgeX = Math.max(r.left, Math.min(px, r.right));
        let edgeY = Math.max(r.top, Math.min(py, r.bottom));
        if (side === 0) edgeY = r.top;
        if (side === 1) edgeX = r.right;
        if (side === 2) edgeY = r.bottom;
        if (side === 3) edgeX = r.left;
        const angle = (Math.atan2(edgeY - (r.top+r.height/2), edgeX - (r.left+r.width/2)) * 180 / Math.PI + 90 + 360) % 360;
        el.style.setProperty("--edge-angle", `${angle}deg`);
        el.style.setProperty("--edge-opacity", String(Math.max(0, 1-distance/proximity)));
        el.classList.add("edge-glow-active");
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    const move = (e) => { if (e.pointerType === "touch") return; px=e.clientX; py=e.clientY; schedule(); };
    const leave = () => { px=-10000; py=-10000; schedule(); };
    const observer = new MutationObserver(() => { scan(); schedule(); });
    scan(); observer.observe(document.body, { childList:true, subtree:true });
    window.addEventListener("pointermove", move, {passive:true}); window.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", schedule, {passive:true,capture:true}); window.addEventListener("resize", schedule);
    return () => { observer.disconnect(); window.removeEventListener("pointermove",move); window.removeEventListener("pointerleave",leave); window.removeEventListener("scroll",schedule,true); window.removeEventListener("resize",schedule); if(raf)cancelAnimationFrame(raf); elements.forEach((el)=>{el.classList.remove("edge-glow-target","edge-glow-active");el.style.removeProperty("--edge-angle");el.style.removeProperty("--edge-opacity");}); };
  }, []);
  return null;
}
