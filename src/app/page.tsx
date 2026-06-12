"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const { items } = useCartStore();

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      if(data.products) setProducts(data.products);
    }).catch(e => console.error(e));
  }, []);

  return (
    <div>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarText}>
          ENVÍOS GRATIS A PARTIR DE $100 — PAGO MÓVIL, ZELLE Y BINANCE DISPONIBLES
        </div>
      </div>

      {/* Navbar Minimal */}
      <nav className={styles.navbar}>
        <div>
          <Link href="#catalog">Colección</Link>
        </div>
        <div className={styles.logo}>
          Cortez
        </div>
        <div className={styles.cartIcon}>
          <Link href="/cart" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span style={{fontSize: '0.8rem'}}>{items.length}</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <Image 
          src="/images/lente_1_1781241251041.png" 
          alt="Cortez Hero" 
          fill 
          priority
          className={styles.heroImage}
        />
        <div className={`${styles.heroContent} animate-fade-in`}>
          <h1 className={styles.heroTitle}>NUEVA COLECCIÓN</h1>
          <Link href="#catalog" className={styles.heroLink}>
            Ver Catálogo
          </Link>
        </div>
      </section>

      {/* Catalog Section */}
      <div id="catalog">
        {products.filter(p => p.category === 'HOMBRES').length > 0 && (
          <section className={styles.catalogSection} style={{paddingTop: '60px'}}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Hombres</h2>
            </div>
            <div className={styles.grid}>
              {products.filter(p => p.category === 'HOMBRES').map((product) => (
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
        )}

        {products.filter(p => p.category === 'MUJERES').length > 0 && (
          <section className={styles.catalogSection} style={{paddingTop: '60px'}}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Mujeres</h2>
            </div>
            <div className={styles.grid}>
              {products.filter(p => p.category === 'MUJERES').map((product) => (
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
        )}

        {products.filter(p => p.category === 'UNISEX' || !p.category).length > 0 && (
          <section className={styles.catalogSection} style={{paddingTop: '60px'}}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Unisex</h2>
            </div>
            <div className={styles.grid}>
              {products.filter(p => p.category === 'UNISEX' || !p.category).map((product) => (
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
        )}
      </div>
    </div>
  );
}
