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
      if(data.products) setProducts(data.products);
    }).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (activeCategory) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => prev === 0 ? 1 : 0);
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
          {/* Slide 1 */}
          <div className={`${styles.slide} ${currentSlide === 0 ? styles.active : ''}`}>
            <Image 
              src="/hero_1_desktop.png" 
              alt="Cortez Hero 1" 
              fill 
              priority
              className={`${styles.heroImage} ${styles.desktopOnly}`}
            />
            <Image 
              src="/hero_1_mobile.png" 
              alt="Cortez Hero 1 Mobile" 
              fill 
              priority
              className={`${styles.heroImage} ${styles.mobileOnly}`}
            />
          </div>

          {/* Slide 2 */}
          <div className={`${styles.slide} ${currentSlide === 1 ? styles.active : ''}`}>
            <Image 
              src="/hero_2_desktop.png" 
              alt="Cortez Hero 2" 
              fill 
              className={`${styles.heroImage} ${styles.desktopOnly}`}
            />
            <Image 
              src="/hero_2_mobile.png" 
              alt="Cortez Hero 2 Mobile" 
              fill 
              className={`${styles.heroImage} ${styles.mobileOnly}`}
            />
          </div>
        </section>
      )}

      {/* Catalog Section */}
      <div id="catalog">
        <section className={styles.catalogSection} style={{paddingTop: '60px'}}>
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
                    <div className={styles.cardInfo}>
                      <div className={styles.cardTopRow}>
                        <span className={styles.cardTitle}>{product.name}</span>
                        <span className={styles.cardPrice}>${product.price}</span>
                      </div>
                      <span className={`${styles.cardColor} serif-italic`}>{product.color}</span>
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
