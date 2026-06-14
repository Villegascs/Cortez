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
  }, { scope: navRef });

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
          ENVÍOS GRATIS A PARTIR DE $100 — PAGO MÓVIL, ZELLE Y BINANCE
        </div>
        
        <nav 
          style={{
            display: 'grid', 
            gridTemplateColumns: '1fr auto 1fr', 
            alignItems: 'center',
            padding: '15px 20px', 
            borderBottom: '1px solid var(--border-color)',
            background: 'rgba(255,255,255,0.95)', 
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
              background-color: #000;
              transform: translateX(-101%);
              transition: transform 0.3s cubic-bezier(0.86, 0, 0.07, 1);
            }
            .brutal-link:hover::after {
              transform: translateX(0);
            }
            @media (min-width: 768px) {
              .desktop-nav-padding { padding: 20px 40px !important; }
            }
          `}</style>
          
          <div className="hidden-mobile" style={{display:'flex', gap:'20px', fontSize:'0.85rem', fontWeight:600, textTransform:'uppercase'}}>
            <a href="/" className="brutal-link">Inicio</a>
            <Link href="/?category=LENTES" className="brutal-link" target="_blank" rel="noopener noreferrer">Lentes</Link>
            <Link href="/?category=ACCESORIOS" className="brutal-link" target="_blank" rel="noopener noreferrer">Accesorios</Link>
          </div>

          <div className="hidden-desktop" style={{display:'flex', alignItems: 'center'}}>
            <button onClick={() => setIsMenuOpen(true)} style={{padding: '5px'}}>
              <Menu size={24} color="#000" />
            </button>
          </div>
          
          <div style={{textAlign:'center'}}>
            <a href="/" style={{display: 'inline-block'}}>
              <Image src="/logo.png" alt="Cortez" width={180} height={40} style={{ filter: 'invert(1)', objectFit: 'contain', transform: 'scale(2.5)' }} priority />
            </a>
          </div>
          
          <div style={{justifySelf:'end'}}>
            {!isSuccessPage && (
              <Link href="/cart" style={{display: 'flex', alignItems: 'center', gap: '5px', color: '#000'}}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                <span style={{fontSize: '0.8rem', fontWeight: 600}}>{items.length}</span>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundColor: '#fff',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
            <div style={{ paddingLeft: '20px' }}>
              <a href="/" onClick={() => setIsMenuOpen(false)}>
                <Image src="/logo.png" alt="Cortez" width={140} height={35} style={{ filter: 'invert(1)', objectFit: 'contain', transform: 'scale(2)' }} />
              </a>
            </div>
            <button onClick={() => setIsMenuOpen(false)} style={{padding: '5px'}}>
              <X size={28} color="#000" />
            </button>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '30px', fontSize: '1.5rem', fontWeight: 600, textTransform: 'uppercase'}}>
            <a href="/" onClick={() => setIsMenuOpen(false)} style={{textDecoration: 'none', color: 'inherit'}}>Inicio</a>
            <Link href="/?category=LENTES" onClick={() => setIsMenuOpen(false)} target="_blank" rel="noopener noreferrer">Lentes</Link>
            <Link href="/?category=ACCESORIOS" onClick={() => setIsMenuOpen(false)} target="_blank" rel="noopener noreferrer">Accesorios</Link>
            <Link href="/admin" onClick={() => setIsMenuOpen(false)} style={{color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '20px'}}>Admin</Link>
          </div>
        </div>
      )}
    </>
  );
}
