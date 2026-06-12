"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

// Dummy data for initial UI
const products = [
  {
    id: 1,
    name: "cortez aviator",
    color: "Gold & Dark",
    price: 120,
    image: "/images/lente_1_1781241251041.png",
  },
  {
    id: 2,
    name: "cortez wayfarer",
    color: "Matte Black",
    price: 150,
    image: "/images/lente_2_1781241268932.png",
  },
  {
    id: 3,
    name: "cortez vintage",
    color: "Tortoise",
    price: 110,
    image: "/images/lente_3_1781241285563.png",
  },
];

export default function Home() {
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
          <Link href="/cart">Carrito</Link>
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
      <section id="catalog" className={styles.catalogSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Novedades</h2>
          <Link href="#catalog" className="btn-text">Ver todos</Link>
        </div>
        
        <div className={styles.grid}>
          {products.map((product) => (
            <Link href={`/product/${product.id}`} key={product.id}>
              <div className={styles.card}>
                <div className={styles.imageWrapper}>
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={styles.cardImage}
                  />
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
  );
}
