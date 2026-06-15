"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
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
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
        }
      `}</style>

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
          {/* Desktop links (hidden on mobile) */}
          <div className="nav-desktop-links" style={{ display: "flex", gap: "20px", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>
            <a href="/" className="brutal-link">Inicio</a>
            <Link href="/?category=LENTES" className="brutal-link">Lentes</Link>
            <Link href="/?category=ACCESORIOS" className="brutal-link">Accesorios</Link>
          </div>

          {/* Mobile: empty left slot */}
          <div />

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
