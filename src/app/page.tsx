"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";

import Navbar from "@/components/Navbar";

function HomeContent() {
  const [products, setProducts] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      if (data.products) setProducts(data.products);
    }).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (activeCategory) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => prev === 3 ? 0 : prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeCategory]);


  return (
    <div>
      <Navbar />

      <div style={{ paddingTop: '100px' }}>

        {/* Hero Section */}
        {!activeCategory && (
          <section className={styles.hero}>
            <div style={{
            display: 'flex', 
            width: '400%', 
            height: '100%',
            transform: `translateX(-${currentSlide * 25}%)`,
            transition: 'transform 0.8s cubic-bezier(0.86, 0, 0.07, 1)'
          }}>
            {/* Slide 1 */}
            <div style={{ position: 'relative', width: '25%', height: '100%' }}>
              <Image src="/hero_1_desktop.png" alt="Cortez Hero 1" fill priority className={`${styles.heroImage} ${styles.desktopOnly}`} />
              <Image src="/hero_1_mobile.png" alt="Cortez Hero 1 Mobile" fill priority className={`${styles.heroImage} ${styles.mobileOnly}`} />
            </div>

            {/* Slide 2 */}
            <div style={{ position: 'relative', width: '25%', height: '100%' }}>
              <Image src="/hero_2_desktop.png" alt="Cortez Hero 2" fill priority className={`${styles.heroImage} ${styles.desktopOnly}`} />
              <Image src="/hero_2_mobile.png" alt="Cortez Hero 2 Mobile" fill priority className={`${styles.heroImage} ${styles.mobileOnly}`} />
            </div>

            {/* Slide 3 (Rudes) */}
            <div style={{ position: 'relative', width: '25%', height: '100%' }}>
              <Image src="/rudes_portada.png" alt="Cortez Hero 3 Rudes" fill priority className={styles.heroImage} />
            </div>

            {/* Slide 4 (Last Pieces) */}
            <div style={{ position: 'relative', width: '25%', height: '100%' }}>
              <Image src="/last_pieces_desktop.png" alt="Cortez Last Pieces" fill priority className={`${styles.heroImage} ${styles.desktopOnly}`} />
              <Image src="/last_pieces_mobile.png" alt="Cortez Last Pieces Mobile" fill priority className={`${styles.heroImage} ${styles.mobileOnly}`} />
            </div>
          </div>

            <div style={{
              position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 10, width: '95%', maxWidth: '700px', display: 'flex', justifyContent: 'center'
            }}>
              <img src="/texto_principal.png" alt="Cortez Collection" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
            </div>

            {/* Indicadores */}
            <div style={{
              position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '10px', zIndex: 10
            }}>
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer',
                  background: currentSlide === idx ? '#fff' : 'rgba(255,255,255,0.4)',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>
          </section>
        )}

        {/* Catalog Section */}
        <div id="catalog">
          <section className={styles.catalogSection} style={{ paddingTop: '60px' }}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {!activeCategory ? "Catálogo Completo" : activeCategory === 'LENTES' ? 'Lentes' : 'Accesorios'}
              </h2>
            </div>
            <div className={styles.grid}>
              {products
                .filter(p => !activeCategory || p.category === activeCategory || (activeCategory === 'UNISEX' && !p.category))
                .map((product) => (
                  <Link href={`/product/${product.id}`} key={product.id}>
                    <div className={styles.card}>
                      <div className={styles.imageWrapper}>
                        <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className={styles.cardImage} />
                        {product.stock <= 0 && (
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, letterSpacing: '2px', fontSize: '1.2rem', color: '#000', zIndex: 10 }}>SOLD OUT</div>
                        )}
                      </div>
                      <div className={styles.cardInfo} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span className={styles.cardTitle} style={{ fontSize: '1.2rem', fontWeight: 800 }}>{product.name}</span>
                        <span className={styles.cardPrice} style={{ fontSize: '1rem', fontWeight: 600 }}>{product.price} USDT</span>
                        <span className={`${styles.cardColor} serif-italic`} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{product.color}</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <HomeContent />
    </Suspense>
  );
}
