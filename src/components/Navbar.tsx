"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Home, Glasses, Sparkles, User } from "lucide-react";
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
        if (self.direction === 1) {
          showAnim.reverse(); 
        } else {
          showAnim.play(); 
        }
      }
    });
  }, { scope: navRef, dependencies: [] });

  return (
    <>
      <header 
        ref={navRef}
        style={{
          position: 'fixed', 
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 50,
        }}
      >
        <div style={{
          background: '#000',
          color: '#fff',
          textAlign: 'center',
          padding: '8px 20px',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '1px'
        }}>
          NUEVA COLECCIÓN EN CAMINO
        </div>
        
        <nav 
          style={{
            display: 'grid', 
            gridTemplateColumns: '1fr auto 1fr', 
            alignItems: 'center',
            padding: '15px 20px', 
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--navbar-bg)', 
            backdropFilter: 'blur(10px)', 
          }}
        >
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
              bottom: 0;
              left: 0;
              width: 100%;
              height: 2px;
              background-color: var(--text-primary);
              transform: translateX(-101%);
              transition: transform 0.3s cubic-bezier(0.86, 0, 0.07, 1);
            }
            .brutal-link:hover::after {
              transform: translateX(0);
            }
          @media (min-width: 768px) {
            .desktop-nav-padding { padding: 20px 40px !important; }
          }
          
          .villegas-nav-link {
            font-size: 24px;
            color: #ffffff;
            text-decoration: none;
            text-transform: capitalize;
            padding: 15px 30px;
            width: 100%;
            text-align: center;
            transition: all 0.3s ease;
            border-radius: 24px;
          }
          
          .villegas-nav-link:hover, .villegas-nav-link:active {
            background-color: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            transform: translateY(-2px);
          }
        `}</style>
          
          <div className="hidden-mobile" style={{display:'flex', gap:'20px', fontSize:'0.85rem', fontWeight:600, textTransform:'uppercase'}}>
            <a href="/" className="brutal-link">Inicio</a>
            <Link href="/?category=LENTES" className="brutal-link">Lentes</Link>
            <Link href="/?category=ACCESORIOS" className="brutal-link">Accesorios</Link>
          </div>

          <div className="hidden-desktop" style={{display:'flex', alignItems: 'center'}}>
            {/* Hamburger removed */}
          </div>
          
          <div style={{textAlign:'center'}}>
            <a href="/" style={{display: 'inline-block'}}>
              <Image src="/logo.png" alt="Cortez" width={180} height={40} style={{ filter: 'var(--logo-invert)', objectFit: 'contain', transform: 'scale(2.5)' }} priority />
            </a>
          </div>
          
          <div style={{justifySelf:'end'}}>
            {!isSuccessPage && (
              <Link href="/cart" style={{display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-primary)'}}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                <span style={{fontSize: '0.8rem', fontWeight: 600}}>{items.length}</span>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Bottom Navigation Bar (Instagram Style) */}
      <div className="hidden-desktop" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--border-color)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px 0',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
      }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-primary)', textDecoration: 'none', gap: '4px' }}>
          <Home size={24} strokeWidth={1.5} />
          <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>Inicio</span>
        </Link>
        <Link href="/?category=LENTES" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-primary)', textDecoration: 'none', gap: '4px' }}>
          <Glasses size={24} strokeWidth={1.5} />
          <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>Lentes</span>
        </Link>
        <Link href="/?category=ACCESORIOS" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-primary)', textDecoration: 'none', gap: '4px' }}>
          <Sparkles size={24} strokeWidth={1.5} />
          <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>Extras</span>
        </Link>
        <Link href="/admin" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-primary)', textDecoration: 'none', gap: '4px' }}>
          <User size={24} strokeWidth={1.5} />
          <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>Admin</span>
        </Link>
      </div>
    </>
  );
}
