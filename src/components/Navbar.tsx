"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
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
    
    // Create the show/hide animation instance
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
          showAnim.reverse(); // Scrolling down -> Hide
        } else {
          showAnim.play(); // Scrolling up -> Show
        }
      }
    });

  }, { scope: navRef });

  return (
    <nav 
      ref={navRef}
      style={{
        display: 'grid', 
        gridTemplateColumns: '1fr auto 1fr', 
        alignItems: 'center',
        padding: '20px 40px', 
        borderBottom: '1px solid var(--border-color)',
        position: 'fixed', 
        top: '35px', // Below the top bar
        width: '100%',
        background: 'rgba(255,255,255,0.9)', 
        backdropFilter: 'blur(10px)', 
        zIndex: 50,
      }}
    >
      <div style={{display:'flex', gap:'20px', fontSize:'0.85rem', fontWeight:600, textTransform:'uppercase'}}>
        <Link href="/#hombres">Hombres</Link>
        <Link href="/#mujeres">Mujeres</Link>
        <Link href="/#unisex">Unisex</Link>
      </div>
      
      <div style={{textAlign:'center', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-1px'}}>
        <Link href="/" style={{color: 'var(--foreground)'}}>Cortez</Link>
      </div>
      
      <div style={{justifySelf:'end'}}>
        {!isSuccessPage && (
          <Link href="/cart" style={{display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--foreground)'}}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span style={{fontSize: '0.8rem', fontWeight: 600}}>{items.length}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
