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
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { items, addItem } = useCartStore();
  const [added, setAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      if(data.products) {
        setAllProducts(data.products);
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

  const cartItem = items.find(i => i.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const remainingStock = product.stock - quantityInCart;
  const isSoldOut = product.stock <= 0;
  const canAddMore = remainingStock > 0;
  
  const variants = allProducts.filter(p => 
    p.name.trim().toLowerCase() === product.name.trim().toLowerCase()
  );


  const handleAddToCart = () => {
    if (!canAddMore) return;
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
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
            <div className={styles.imageContainer} style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', border: '1px solid #eaeaea' }}>
              <div style={{
                display: 'flex',
                width: '100%', height: '100%',
                transition: 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
                transform: `translateX(-${currentImageIndex * 100}%)`
              }}>
                {allImages.map((img: string, idx: number) => (
                  <div key={idx} style={{ flex: '0 0 100%', height: '100%', position: 'relative' }}>
                    <Image 
                      src={img} 
                      alt={`${product.name} - ${idx + 1}`} 
                      fill 
                      sizes="(max-width: 992px) 100vw, 50vw"
                      className={styles.mainImage}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {allImages.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentImageIndex((prev: number) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                  style={{
                    position: 'absolute', left: '-16px', top: '50%', transform: 'translateY(-50%)',
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%',
                    width: '32px', height: '32px', cursor: 'pointer', zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                    color: '#0f172a'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button 
                  onClick={() => setCurrentImageIndex((prev: number) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                  style={{
                    position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)',
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%',
                    width: '32px', height: '32px', cursor: 'pointer', zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                    color: '#0f172a'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
                <div style={{
                  position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: '8px', zIndex: 5
                }}>
                  {allImages.map((_: any, idx: number) => (
                    <div key={idx} onClick={() => setCurrentImageIndex(idx)} style={{
                      width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
                      background: idx === currentImageIndex ? '#0f172a' : 'rgba(15,23,42,0.3)',
                      transition: 'background 0.3s ease'
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
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '10px', fontFamily: 'var(--font-sans)' }}>
              Color: <span style={{ fontWeight: 400, color: '#4b5563' }}>{product.color}</span>
            </p>
            {variants.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {variants.map(v => (
                  <Link href={`/product/${v.id}`} key={v.id} title={v.color}>
                    <div style={{
                      width: '60px', height: '60px', position: 'relative', 
                      border: v.id === product.id ? '2px solid #000' : '1px solid #eaeaea', 
                      borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', 
                      opacity: v.id === product.id ? 1 : 0.6, transition: 'all 0.2s ease',
                      padding: '2px'
                    }}>
                      <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '2px', overflow: 'hidden' }}>
                        <Image src={v.image} alt={v.color} fill style={{ objectFit: 'contain', background: '#fff' }} sizes="60px" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <p className={styles.price}>{product.price} USDT</p>
          
          <div className={styles.divider}></div>
          
          <p className={styles.description}>{product.description}</p>

          {product.stock === 1 && (
             <p style={{ color: '#d97706', fontSize: '0.85rem', fontWeight: 600, marginTop: '15px' }}>
                ⚠️ Solo queda 1 unidad disponible de este modelo de lente.
             </p>
          )}
          {product.stock > 1 && remainingStock === 0 && !isSoldOut && (
             <p style={{ color: '#d97706', fontSize: '0.85rem', fontWeight: 600, marginTop: '15px' }}>
                ⚠️ Ya tienes todas las unidades disponibles en tu cesta.
             </p>
          )}

          <button 
            className={`btn-primary ${styles.addToCartBtn}`} 
            onClick={handleAddToCart}
            style={!canAddMore ? { background: '#ccc', cursor: 'not-allowed', color: '#666', marginTop: '15px' } : { marginTop: '15px' }}
            disabled={!canAddMore}
          >
            {isSoldOut ? "AGOTADO" : (!canAddMore ? "LÍMITE ALCANZADO" : "AÑADIR A LA CESTA")}
          </button>
        </div>
      </div>

      <div style={{ padding: '80px 40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '30px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>También te podría gustar</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {allProducts
            .filter((p: any) => p.id !== product.id)
            .slice(0, 4)
            .map((p: any) => (
              <Link href={`/product/${p.id}`} key={p.id}>
                <div style={{ cursor: 'pointer' }}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', backgroundColor: 'transparent', marginBottom: '15px' }}>
                    <Image src={p.image} alt={p.name} fill style={{ objectFit: 'contain' }} sizes="(max-width: 768px) 100vw, 25vw" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.name}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{p.price} USDT</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }} className="serif-italic">{p.color}</span>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {added && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--bg-color)', padding: '40px', maxWidth: '400px', width: '90%',
            textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px',
            animation: 'fadeIn 0.3s ease',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)'
          }}>
            <h2 style={{textTransform:'uppercase', fontSize:'1.2rem', margin:0}}>Añadido a la Cesta</h2>
            <p style={{margin:0, color:'var(--text-secondary)'}}>
              Has añadido <strong>{product.name} - {product.color}</strong> exitosamente.
            </p>
            <div style={{display:'flex', gap:'10px', flexDirection:'column', marginTop:'10px'}}>
              <Link href="/cart" className="btn-primary">Ver la Cesta y Pagar</Link>
              <button 
                onClick={() => setAdded(false)} 
                className="btn-secondary"
                style={{ width: '100%' }}
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
