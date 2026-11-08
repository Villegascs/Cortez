"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
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
    <Link href={`/product/${product.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {allImages.map((img, idx) => (
          <Image 
            key={idx} 
            src={img} 
            alt={`${product.name} ${idx + 1}`} 
            fill 
            sizes="(max-width: 768px) 50vw, 33vw" 
            className={styles.cardImage} 
            style={{
              opacity: currentImageIndex === idx ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out'
            }}
          />
        ))}
        {product.stock <= 0 && (
          <div className={styles.soldOutOverlay}>SOLD OUT</div>
        )}
      </div>
      <div className={styles.cardInfo}>
        <span className={styles.cardTitle}>{product.name}</span>
        <span className={styles.cardPrice}>{product.price} €</span>
        <span className={`${styles.cardColor} serif-italic`}>
          {product.collection || product.color}
        </span>
      </div>
    </Link>
  );
}

function HomeContent() {
  const [products, setProducts] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'TODOS';
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      if (data.products) setProducts(data.products);
    }).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (activeCategory !== 'TODOS') return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev === 2 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [activeCategory]);

  const filteredProducts = products.filter(p => {
    if (!activeCategory || activeCategory === 'TODOS') return true;
    if (activeCategory === 'LENTES') return p.category === 'LENTES' || !p.category;
    if (activeCategory === 'ACCESORIOS') return p.category === 'ACCESORIOS';
    return true;
  });

  return (
    <div>
      <Navbar />

      <div style={{ paddingTop: '95px' }}>
        {/* Hero Section (Visible when browsing all) */}
        {(!activeCategory || activeCategory === 'TODOS') && (
          <section className={styles.hero}>
            <div
              className={styles.heroTrack}
              style={{
                transform: `translateX(-${currentSlide * 33.3333}%)`
              }}
            >
              {/* Slide 1 */}
              <div className={styles.heroSlide}>
                <Image src="/hero_1_desktop.png" alt="Cortez Hero 1" fill priority className={`${styles.heroImage} ${styles.desktopOnly}`} />
                <Image src="/hero_1_mobile.png" alt="Cortez Hero 1 Mobile" fill priority className={`${styles.heroImage} ${styles.mobileOnly}`} />
              </div>

              {/* Slide 2 */}
              <div className={styles.heroSlide}>
                <Image src="/hero_2_desktop.png" alt="Cortez Hero 2" fill priority className={`${styles.heroImage} ${styles.desktopOnly}`} />
                <Image src="/hero_2_mobile.png" alt="Cortez Hero 2 Mobile" fill priority className={`${styles.heroImage} ${styles.mobileOnly}`} />
              </div>

              {/* Slide 3 (Rudes) */}
              <div className={styles.heroSlide}>
                <Image src="/rudes_portada.png" alt="Cortez Hero 3 Rudes" fill priority className={`${styles.heroImage} ${styles.desktopOnly}`} />
                <Image src="/rudes_portada_mobile.jpg" alt="Cortez Hero 3 Rudes Mobile" fill priority className={`${styles.heroImage} ${styles.mobileOnly}`} />
              </div>
            </div>

            {/* Main overlay text banner */}
            <div className={styles.heroOverlayText}>
              <img
                src="/texto_principal.png"
                alt="Cortez Collection"
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>

            {/* Slider Dots */}
            <div className={styles.heroIndicators}>
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={styles.indicatorDot}
                  style={{
                    background: currentSlide === idx ? '#fff' : 'rgba(255,255,255,0.4)',
                    transform: currentSlide === idx ? 'scale(1.2)' : 'scale(1)'
                  }}
                  aria-label={`Ir al slide ${idx + 1}`}
                />
              ))}
            </div>
          </section>
        )}

        {/* Catalog Section */}
        <div id="catalog">
          <section className={styles.catalogSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleRow}>
                <h2 className={styles.sectionTitle}>
                  {activeCategory === 'TODOS'
                    ? "Catálogo Completo"
                    : activeCategory === 'LENTES'
                    ? 'Lentes'
                    : 'Accesorios'}
                </h2>
              </div>

              {/* Filter Pills */}
              <div className={styles.categoryTabs}>
                <Link
                  href="/"
                  className={`${styles.categoryPill} ${activeCategory === 'TODOS' ? styles.categoryPillActive : ''}`}
                >
                  Todos
                </Link>
                <Link
                  href="/?category=LENTES"
                  className={`${styles.categoryPill} ${activeCategory === 'LENTES' ? styles.categoryPillActive : ''}`}
                >
                  Lentes
                </Link>
                <Link
                  href="/?category=ACCESORIOS"
                  className={`${styles.categoryPill} ${activeCategory === 'ACCESORIOS' ? styles.categoryPillActive : ''}`}
                >
                  Accesorios
                </Link>
              </div>
            </div>

            {/* Product Grid */}
            <div className={styles.grid}>
              {filteredProducts.map((product) => (
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
    <Suspense fallback={<div style={{ padding: '60px 20px', textAlign: 'center' }}>Cargando catálogo...</div>}>
      <HomeContent />
    </Suspense>
  );
}
