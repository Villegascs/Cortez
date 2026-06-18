"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";

import Navbar from "@/components/Navbar";

function ProductCard({ product }: { product: any }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = useMemo(() => {
    let extraImages = [];
    try {
      extraImages = JSON.parse(product.images || "[]");
    } catch (e) {}
    return [product.image, ...extraImages].filter(Boolean);
  }, [product]);

  useEffect(() => {
    if (allImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % allImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [allImages]);

  return (
    <Link href={`/product/${product.id}`}>
      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          {allImages.map((img, idx) => (
            <Image 
              key={idx} 
              src={img} 
              alt={`${product.name} ${idx}`} 
              fill 
              sizes="(max-width: 768px) 100vw, 33vw" 
              className={styles.cardImage} 
              style={{
                opacity: currentImageIndex === idx ? 1 : 0,
                transition: 'opacity 0.8s ease-in-out'
              }}
            />
          ))}
          {product.stock <= 0 && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, letterSpacing: '2px', fontSize: '1.2rem', color: '#000', zIndex: 10 }}>SOLD OUT</div>
          )}
        </div>
        <div className={styles.cardInfo} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className={styles.cardTitle} style={{ fontSize: '1.2rem', fontWeight: 800 }}>{product.name}</span>
          <span className={styles.cardPrice} style={{ fontSize: '1rem', fontWeight: 600 }}>{product.price} USDT</span>
          <span className={`${styles.cardColor} serif-italic`} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{product.collection || product.color}</span>
        </div>
      </div>
    </Link>
  );
}

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
      setCurrentSlide(prev => prev === 2 ? 0 : prev + 1);
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
            width: '300%', 
            height: '100%',
            transform: `translateX(-${currentSlide * 33.3333}%)`,
            transition: 'transform 0.8s cubic-bezier(0.86, 0, 0.07, 1)'
          }}>
            {/* Slide 1 */}
            <div style={{ position: 'relative', width: '33.3333%', height: '100%' }}>
              <Image src="/hero_1_desktop.png" alt="Cortez Hero 1" fill priority className={`${styles.heroImage} ${styles.desktopOnly}`} />
              <Image src="/hero_1_mobile.png" alt="Cortez Hero 1 Mobile" fill priority className={`${styles.heroImage} ${styles.mobileOnly}`} />
            </div>

            {/* Slide 2 */}
            <div style={{ position: 'relative', width: '33.3333%', height: '100%' }}>
              <Image src="/hero_2_desktop.png" alt="Cortez Hero 2" fill priority className={`${styles.heroImage} ${styles.desktopOnly}`} />
              <Image src="/hero_2_mobile.png" alt="Cortez Hero 2 Mobile" fill priority className={`${styles.heroImage} ${styles.mobileOnly}`} />
            </div>

            {/* Slide 3 (Rudes) */}
            <div style={{ position: 'relative', width: '33.3333%', height: '100%' }}>
              <Image src="/rudes_portada.png" alt="Cortez Hero 3 Rudes" fill priority className={`${styles.heroImage} ${styles.desktopOnly}`} />
              <Image src="/rudes_portada_mobile.jpg" alt="Cortez Hero 3 Rudes Mobile" fill priority className={`${styles.heroImage} ${styles.mobileOnly}`} />
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
            {[0, 1, 2].map((idx) => (
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
                  <ProductCard key={product.id} product={product} />
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
