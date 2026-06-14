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

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      if(data.products) setProducts(data.products);
    }).catch(e => console.error(e));
  }, []);


  return (
    <div>
      <Navbar />

      <div style={{ paddingTop: '100px' }}>

      {/* Hero Section */}
      <section className={styles.hero}>
        <Image 
          src="/portada.jpg" 
          alt="Cortez Hero" 
          fill 
          priority
          className={styles.heroImage}
        />

      </section>

      {/* Catalog Section */}
      <div id="catalog">
        <section className={styles.catalogSection} style={{paddingTop: '60px'}}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {!activeCategory ? "Catálogo Completo" : activeCategory === 'HOMBRES' ? 'Hombres' : activeCategory === 'MUJERES' ? 'Mujeres' : 'Unisex'}
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
