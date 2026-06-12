"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import styles from "./page.module.css";
import { ShieldCheck, Truck, RotateCcw, ShoppingBag } from "lucide-react";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { items, addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      if(data.products) {
        const found = data.products.find((p: any) => p.id === Number(resolvedParams.id));
        setProduct(found);
      }
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, [resolvedParams.id]);

  if (loading) return <div style={{padding:'40px', textAlign:'center'}}>Cargando producto...</div>;

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1>Producto no encontrado</h1>
        <Link href="/" className="btn-primary">Volver al catálogo</Link>
      </div>
    );
  }

  const isSoldOut = product.stock <= 0;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addItem({
      id: product.id,
      name: `${product.name} - ${product.color}`,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
  };

  return (
    <div className={styles.container}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        ENVÍOS GRATIS A PARTIR DE $100 — PAGO MÓVIL, ZELLE Y BINANCE DISPONIBLES
      </div>

      {/* Navbar Minimal */}
      <nav className={styles.navbar}>
        <div>
          <Link href="/">Colección</Link>
        </div>
        <div className={styles.logo}>
          <Link href="/">Cortez</Link>
        </div>
        <div className={styles.cartIcon}>
          <Link href="/cart" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span style={{fontSize: '0.8rem'}}>{items.length}</span>
          </Link>
        </div>
      </nav>

      <div className={styles.productWrapper}>
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              sizes="(max-width: 992px) 100vw, 50vw"
              className={styles.mainImage}
            />
            {isSoldOut && (
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                background: 'rgba(255,255,255,0.7)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, letterSpacing: '2px', fontSize: '1.2rem', color: '#000',
                zIndex: 10
              }}>
                SOLD OUT
              </div>
            )}
          </div>
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={`${styles.color} serif-italic`}>{product.color}</p>
          <p className={styles.price}>${product.price} USD</p>
          
          <div className={styles.divider}></div>
          
          <p className={styles.description}>{product.description}</p>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <ShieldCheck size={18} /> Protección UV400
            </div>
            <div className={styles.featureItem}>
              <Truck size={18} /> Envío exprés disponible
            </div>
            <div className={styles.featureItem}>
              <RotateCcw size={18} /> 14 días para devoluciones
            </div>
          </div>

          <button 
            className={`btn-primary ${styles.addToCartBtn}`} 
            onClick={handleAddToCart}
            style={isSoldOut ? { background: '#ccc', cursor: 'not-allowed', color: '#666' } : {}}
            disabled={isSoldOut}
          >
            {isSoldOut ? "AGOTADO" : "AÑADIR A LA CESTA"}
          </button>
        </div>
      </div>

      {added && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', padding: '40px', maxWidth: '400px', width: '90%',
            textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px',
            animation: 'fadeIn 0.3s ease'
          }}>
            <h2 style={{textTransform:'uppercase', fontSize:'1.2rem', margin:0}}>Añadido a la Cesta</h2>
            <p style={{margin:0, color:'var(--text-secondary)'}}>
              Has añadido <strong>{product.name} - {product.color}</strong> exitosamente.
            </p>
            <div style={{display:'flex', gap:'10px', flexDirection:'column', marginTop:'10px'}}>
              <Link href="/cart" className="btn-primary">Ver la Cesta y Pagar</Link>
              <button 
                onClick={() => setAdded(false)} 
                style={{
                  background:'transparent', border:'1px solid var(--border-color)',
                  padding:'15px', cursor:'pointer', fontWeight:600, textTransform:'uppercase',
                  letterSpacing:'1px', fontSize:'0.8rem'
                }}
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
