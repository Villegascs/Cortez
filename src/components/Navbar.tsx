"use client";

import { useRef, useEffect, useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <button type="button" onClick={() => setIsMenuOpen(true)} style={{padding: '5px', background: 'transparent', border: 'none', cursor: 'pointer'}}>
              <Menu size={24} style={{ color: 'var(--icon-color)' }} />
            </button>
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

      {/* Mobile Drawer */}
      <div 
        className={`mobile-drawer ${isMenuOpen ? 'is-open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(11, 14, 20, 0.98)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          opacity: isMenuOpen ? 1 : 0,
          pointerEvents: isMenuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
          <div style={{ paddingLeft: '20px' }}>
            <a href="/" onClick={() => setIsMenuOpen(false)}>
              <Image src="/logo.png" alt="Cortez" width={140} height={35} style={{ filter: 'invert(1)', objectFit: 'contain', transform: 'scale(2)' }} />
            </a>
          </div>
          <button onClick={() => setIsMenuOpen(false)} style={{ padding: '10px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={32} color="#ffffff" strokeWidth={1.5} />
          </button>
        </div>
        
        <div style={{
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '20px', 
          width: '100%',
          padding: '0 20px'
        }}>
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="villegas-nav-link">Inicio</Link>
          <Link href="/?category=LENTES" onClick={() => setIsMenuOpen(false)} className="villegas-nav-link">Lentes</Link>
          <Link href="/?category=ACCESORIOS" onClick={() => setIsMenuOpen(false)} className="villegas-nav-link">Accesorios</Link>
          <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="villegas-nav-link" style={{marginTop: '40px', fontSize: '1.2rem', color: '#888'}}>Admin</Link>
        </div>
      </div>
    </>
  );
}
