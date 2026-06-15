"use client";

import { useRef, useState, useCallback } from "react";
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

  const close = useCallback(() => setOpen(false), []);

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
        /* ---- Desktop links ---- */
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

        /* ---- Mobile drawer overlay ---- */
        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 9998;
        }
        .mobile-overlay.is-open { display: block; }

        /* ---- Mobile drawer panel ---- */
        .mobile-drawer-panel {
          position: fixed;
          top: 0; right: 0;
          width: min(320px, 85vw);
          height: 100%;
          background: #0b0e14;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          padding: 0;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          -webkit-overflow-scrolling: touch;
          overflow-y: auto;
        }
        .mobile-drawer-panel.is-open {
          transform: translateX(0);
        }

        /* ---- Drawer close button ---- */
        .drawer-close-btn {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 20px 20px 0;
        }
        .drawer-close-btn button {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: #fff;
          -webkit-tap-highlight-color: transparent;
        }

        /* ---- Drawer nav links ---- */
        .drawer-nav {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 40px 24px;
          flex: 1;
        }
        .drawer-link {
          display: block;
          width: 100%;
          padding: 18px 24px;
          color: #fff;
          text-decoration: none;
          font-size: 1.1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          border-radius: 16px;
          text-align: center;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.2s ease;
        }
        .drawer-link:active, .drawer-link:hover {
          background: rgba(255,255,255,0.1);
        }
        .drawer-divider {
          width: 100%;
          height: 1px;
          background: rgba(255,255,255,0.1);
          margin: 16px 0;
        }

        /* ---- Hamburger button ---- */
        .hamburger-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--text-primary);
          -webkit-tap-highlight-color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ---- Desktop/Mobile visibility ---- */
        @media (min-width: 768px) {
          .hidden-mobile { display: flex !important; }
          .hidden-desktop { display: none !important; }
          .mobile-overlay, .mobile-drawer-panel { display: none !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .hidden-desktop { display: flex !important; }
        }
      `}</style>

      {/* Dark overlay behind drawer */}
      <div
        className={`mobile-overlay ${open ? 'is-open' : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Side Drawer Panel */}
      <div className={`mobile-drawer-panel ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menú">
        <div className="drawer-close-btn">
          <button type="button" onClick={close} aria-label="Cerrar menú">
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="drawer-nav">
          <Link href="/" className="drawer-link" onClick={close}>Inicio</Link>
          <Link href="/?category=LENTES" className="drawer-link" onClick={close}>Lentes</Link>
          <Link href="/?category=ACCESORIOS" className="drawer-link" onClick={close}>Accesorios</Link>
          <div className="drawer-divider" />
          <Link href="/cart" className="drawer-link" onClick={close} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            🛍 Carrito ({items.length})
          </Link>
          <Link href="/admin" className="drawer-link" onClick={close} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
            Admin
          </Link>
        </nav>
      </div>

      {/* Header */}
      <header
        ref={navRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 50 }}
      >
        <div style={{
          background: '#000', color: '#fff', textAlign: 'center',
          padding: '8px 20px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px'
        }}>
          NUEVA COLECCIÓN EN CAMINO
        </div>

        <nav style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '15px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--navbar-bg)',
          backdropFilter: 'blur(10px)',
        }}>
          {/* Desktop Links */}
          <div className="hidden-mobile" style={{ gap: '20px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <a href="/" className="brutal-link">Inicio</a>
            <Link href="/?category=LENTES" className="brutal-link">Lentes</Link>
            <Link href="/?category=ACCESORIOS" className="brutal-link">Accesorios</Link>
          </div>

          {/* Mobile: Hamburger button */}
          <div className="hidden-desktop" style={{ alignItems: 'center' }}>
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={open}
            >
              <Menu size={26} strokeWidth={1.5} />
            </button>
          </div>

          {/* Logo (center) */}
          <div style={{ textAlign: 'center' }}>
            <a href="/" style={{ display: 'inline-block' }}>
              <Image
                src="/logo.png"
                alt="Cortez"
                width={180}
                height={40}
                style={{ filter: 'var(--logo-invert)', objectFit: 'contain', transform: 'scale(2.5)' }}
                priority
              />
            </a>
          </div>

          {/* Cart icon (right) */}
          <div style={{ justifySelf: 'end' }}>
            {!isSuccessPage && (
              <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-primary)' }}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{items.length}</span>
              </Link>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
