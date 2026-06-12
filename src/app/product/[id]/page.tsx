"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import styles from "./page.module.css";
import { ShieldCheck, Truck, RotateCcw, ShoppingBag } from "lucide-react";

import Navbar from "@/components/Navbar";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { items, addItem } = useCartStore();
  const [added, setAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const extraImages = product.images ? JSON.parse(product.images) : [];
  const allImages = [product.image, ...extraImages];

  return (
    <div className={styles.container}>
      <Navbar />

      <div style={{ paddingTop: '100px' }}>

      <div className={styles.productWrapper}>
        <div className={styles.imageSection}>
          <div className={styles.imageContainer} style={{ position: 'relative' }}>
            <Image 
              src={allImages[currentImageIndex]} 
              alt={`${product.name} - ${currentImageIndex + 1}`} 
              fill 
              sizes="(max-width: 992px) 100vw, 50vw"
              className={styles.mainImage}
            />
            
            {allImages.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImageIndex((prev: number) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                  style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%',
                    width: '40px', height: '40px', cursor: 'pointer', zIndex: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button 
                  onClick={() => setCurrentImageIndex((prev: number) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%',
                    width: '40px', height: '40px', cursor: 'pointer', zIndex: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
                <div style={{
                  position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: '8px', zIndex: 5
                }}>
                  {allImages.map((_: any, idx: number) => (
                    <div key={idx} onClick={() => setCurrentImageIndex(idx)} style={{
                      width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
                      background: idx === currentImageIndex ? '#000' : 'rgba(0,0,0,0.3)'
                    }} />
                  ))}
                </div>
              </>
            )}

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
    </div>
  );
}
