"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        // Do not hide navbar if mobile menu is currently open
        if (mobileMenuOpen) return;
        if (self.direction === 1) { showAnim.reverse(); }
        else { showAnim.play(); }
      }
    });
  }, { scope: navRef, dependencies: [mobileMenuOpen] });

  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

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

        /* Desktop vs Mobile Navigation */
        .desktop-nav-content {
          display: none;
        }
        .mobile-nav-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          color: var(--text-primary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .mobile-nav-toggle:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .navbar-logo-container {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          z-index: 1;
        }

        .navbar-logo-img {
          filter: var(--logo-invert);
          object-fit: contain;
          transform-origin: center;
        }

        /* Mobile specific */
        @media (max-width: 768px) {
          .desktop-nav-content { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
          .navbar-logo-img {
            width: 115px;
            height: 28px;
            transform: scale(1.15);
          }
        }

        @media (max-width: 480px) {
          .navbar-logo-img {
            width: 105px;
            height: 26px;
            transform: scale(1.05);
          }
        }

        /* Desktop specific */
        @media (min-width: 769px) {
          .desktop-nav-content { display: flex !important; }
          .mobile-nav-toggle { display: none !important; }
          .navbar-logo-img {
            width: 180px;
            height: 42px;
            transform: scale(2.3);
          }
        }

        /* Mobile drawer animation */
        .mobile-drawer {
          position: fixed;
          top: 96px; /* below top promo bar and navbar */
          left: 0;
          width: 100%;
          height: calc(100vh - 96px);
          background: var(--navbar-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 49;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 30px 24px 40px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          animation: slideDownMenu 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border-bottom: 1px solid var(--border-color);
        }

        @keyframes slideDownMenu {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <header
        ref={navRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 50 }}
      >
        {/* Top Announcement Bar */}
        <div style={{
          background: "#000", color: "#fff", textAlign: "center",
          padding: "7px 16px", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "1.2px",
          textTransform: "uppercase"
        }}>
          NUEVA COLECCIÓN EN CAMINO
        </div>

        {/* Main Navbar */}
        <nav style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid var(--border-color)",
          background: "var(--navbar-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          minHeight: "60px",
        }}>
          {/* LEFT SLOT */}
          <div style={{ display: "flex", alignItems: "center", zIndex: 2 }}>
            {/* Desktop Navigation Links */}
            <div className="desktop-nav-content" style={{ gap: "24px", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <Link href="/" className="brutal-link">Inicio</Link>
              <Link href="/?category=LENTES" className="brutal-link">Lentes</Link>
              <Link href="/?category=ACCESORIOS" className="brutal-link">Accesorios</Link>
            </div>

            {/* Mobile Navigation Toggle Button */}
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* CENTER SLOT: Cortez Logo */}
          <div className="navbar-logo-container">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ display: "inline-flex", alignItems: "center" }}>
              <Image
                src="/logo.png"
                alt="Cortez"
                width={180}
                height={42}
                className="navbar-logo-img"
                priority
              />
            </Link>
          </div>

          {/* RIGHT SLOT: Cart Icon & Count */}
          <div style={{ display: "flex", alignItems: "center", zIndex: 2 }}>
            {!isSuccessPage && (
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--text-primary)",
                  padding: "8px",
                  borderRadius: "8px",
                  transition: "background 0.2s ease"
                }}
                aria-label={`Ver cesta con ${totalItems} productos`}
              >
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <ShoppingBag size={21} strokeWidth={1.6} />
                  {totalItems > 0 && (
                    <span style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-8px",
                      background: "#000",
                      color: "#fff",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
                    }}>
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>
            )}
          </div>
        </nav>

        {/* MOBILE MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="mobile-drawer">
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "1px", textTransform: "uppercase" }}>
                Navegación
              </div>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-primary)",
                  letterSpacing: "0.5px"
                }}
              >
                Inicio
              </Link>
              <Link
                href="/?category=LENTES"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-primary)",
                  letterSpacing: "0.5px"
                }}
              >
                Lentes
              </Link>
              <Link
                href="/?category=ACCESORIOS"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-primary)",
                  letterSpacing: "0.5px"
                }}
              >
                Accesorios
              </Link>

              <div style={{ height: "1px", background: "var(--border-color)", margin: "10px 0" }} />

              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  padding: "12px 16px",
                  background: "var(--surface-color)",
                  borderRadius: "10px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <ShoppingBag size={20} />
                  <span>Tu Cesta</span>
                </div>
                <span style={{
                  background: "#000",
                  color: "#fff",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "12px"
                }}>
                  {totalItems} items
                </span>
              </Link>
            </div>

            {/* Bottom Section with Social and Brand */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <a
                href="https://www.instagram.com/cortez.ve/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "var(--text-secondary)",
                  fontSize: "0.95rem",
                  fontWeight: 500
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>Síguenos en Instagram @cortez.ve</span>
              </a>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                &copy; {new Date().getFullYear()} Cortez Eyewear. Todos los derechos reservados.
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
