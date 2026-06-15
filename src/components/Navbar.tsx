"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, X, Menu } from "lucide-react";
import { useCartStore } from "@/store/cart";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function Navbar({ isSuccessPage = false }: { isSuccessPage?: boolean }) {
  const { items } = useCartStore();
  const navRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(() => {
    if (!navRef.current) return;
    const showAnim = gsap.from(navRef.current, {
      yPercent: -100,
      paused: true,
      duration: 0.3,
      ease: "power2.out"
    }).progress(1);

    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        if (self.direction === 1) { showAnim.reverse(); }
        else { showAnim.play(); }
      }
    });
  }, { scope: navRef, dependencies: [] });

  return (
    <>
      <style>{`
        .brutal-link {
          position: relative;
          display: inline-block;
          padding-bottom: 2px;
          overflow: hidden;
        }
        .brutal-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 100%; height: 2px;
          background-color: var(--text-primary);
          transform: translateX(-101%);
          transition: transform 0.3s cubic-bezier(0.86, 0, 0.07, 1);
        }
        .brutal-link:hover::after { transform: translateX(0); }

        /* Overlay - use fixed inset:0 WITHOUT overflow:hidden on body */
        #mobile-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.55);
          z-index: 9997;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        #mobile-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* Drawer panel */
        #mobile-drawer {
          position: fixed;
          top: 0; right: 0; bottom: 0;
          width: 80vw;
          max-width: 300px;
          background: #0d0d0d;
          z-index: 9998;
          display: flex;
          flex-direction: column;
          transform: translate3d(100%, 0, 0);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }
        #mobile-drawer.open {
          transform: translate3d(0, 0, 0);
        }

        .drawer-top {
          display: flex;
          justify-content: flex-end;
          padding: 20px;
        }
        .drawer-close {
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 8px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .drawer-links {
          display: flex;
          flex-direction: column;
          padding: 10px 20px;
          gap: 4px;
        }
        .drawer-link {
          display: block;
          padding: 16px 20px;
          color: #fff;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          border-radius: 12px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .drawer-link:active {
          background: rgba(255,255,255,0.1);
        }
        .drawer-sep {
          height: 1px;
          background: rgba(255,255,255,0.12);
          margin: 12px 20px;
        }
        .drawer-link-muted {
          display: block;
          padding: 12px 20px;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        /* Hamburger button */
        .ham-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--text-primary);
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          display: flex;
          align-items: center;
        }

        /* Desktop-only nav links (shown above 768px) */
        .nav-desktop { display: none; }
        .nav-mobile  { display: flex; }

        @media (min-width: 769px) {
          .nav-desktop { display: flex; }
          .nav-mobile  { display: none; }
          #mobile-drawer, #mobile-overlay { display: none !important; }
        }
      `}</style>

      {/* Dark overlay */}
      <div
        id="mobile-overlay"
        className={open ? "open" : ""}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div id="mobile-drawer" className={open ? "open" : ""} role="dialog" aria-modal="true">
        <div className="drawer-top">
          <button type="button" className="drawer-close" onClick={() => setOpen(false)} aria-label="Cerrar">
            <X size={26} strokeWidth={1.5} />
          </button>
        </div>
        <nav className="drawer-links">
          <Link href="/" className="drawer-link" onClick={() => setOpen(false)}>Inicio</Link>
          <Link href="/?category=LENTES" className="drawer-link" onClick={() => setOpen(false)}>Lentes</Link>
          <Link href="/?category=ACCESORIOS" className="drawer-link" onClick={() => setOpen(false)}>Accesorios</Link>
          <div className="drawer-sep" />
          <Link href="/cart" className="drawer-link-muted" onClick={() => setOpen(false)}>🛍 Carrito ({items.length})</Link>
          <Link href="/admin" className="drawer-link-muted" onClick={() => setOpen(false)}>Admin</Link>
        </nav>
      </div>

      {/* Header */}
      <header
        ref={navRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 50 }}
      >
        <div style={{
          background: "#000", color: "#fff", textAlign: "center",
          padding: "8px 20px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "1px"
        }}>
          NUEVA COLECCIÓN EN CAMINO
        </div>

        <nav style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "15px 20px",
          borderBottom: "1px solid var(--border-color)",
          background: "var(--navbar-bg)",
          backdropFilter: "blur(10px)",
        }}>
          {/* Left slot */}
          <div>
            {/* Desktop links */}
            <div className="nav-desktop" style={{ gap: "20px", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>
              <a href="/" className="brutal-link">Inicio</a>
              <Link href="/?category=LENTES" className="brutal-link">Lentes</Link>
              <Link href="/?category=ACCESORIOS" className="brutal-link">Accesorios</Link>
            </div>

            {/* Mobile: hamburger */}
            <div className="nav-mobile" style={{ alignItems: "center" }}>
              <button
                type="button"
                className="ham-btn"
                onClick={() => setOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu size={26} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Center: logo */}
          <div style={{ textAlign: "center" }}>
            <a href="/" style={{ display: "inline-block" }}>
              <Image
                src="/logo.png"
                alt="Cortez"
                width={180}
                height={40}
                style={{ filter: "var(--logo-invert)", objectFit: "contain", transform: "scale(2.5)" }}
                priority
              />
            </a>
          </div>

          {/* Right: cart */}
          <div style={{ justifySelf: "end" }}>
            {!isSuccessPage && (
              <Link href="/cart" style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-primary)" }}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{items.length}</span>
              </Link>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
