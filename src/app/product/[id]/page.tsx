"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import styles from "./page.module.css";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
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

  if (loading) return <div style={{ padding: '60px 20px', textAlign: 'center' }}>Cargando producto...</div>;

  if (!product) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Producto no encontrado</h1>
        <Link href="/" className="btn-primary" style={{ display: 'inline-block', padding: '12px 24px' }}>
          Volver al catálogo
        </Link>
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

      <div style={{ paddingTop: '95px' }}>
        <div className={styles.productWrapper}>
          {/* Gallery Section */}
          <div className={styles.imageSection}>
            <div className={styles.galleryCard}>
              <div className={styles.imageContainer}>
                <div
                  className={styles.imageSlider}
                  style={{
                    transform: `translateX(-${currentImageIndex * 100}%)`
                  }}
                >
                  {allImages.map((img: string, idx: number) => (
                    <div key={idx} className={styles.imageSlide}>
                      <Image 
                        src={img} 
                        alt={`${product.name} - ${idx + 1}`} 
                        fill 
                        sizes="(max-width: 991px) 100vw, 50vw"
                        className={styles.mainImage}
                        priority={idx === 0}
                      />
                    </div>
                  ))}
                </div>

                {isSoldOut && (
                  <div className={styles.soldOutBanner}>
                    SOLD OUT
                  </div>
                )}
              </div>
              
              {/* Carousel Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button 
                    type="button"
                    onClick={() => setCurrentImageIndex((prev: number) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                    className={`${styles.navArrow} ${styles.navArrowPrev}`}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCurrentImageIndex((prev: number) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                    className={`${styles.navArrow} ${styles.navArrowNext}`}
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Dot Indicators */}
                  <div className={styles.dotsWrapper}>
                    {allImages.map((_: any, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={styles.galleryDot}
                        style={{
                          background: idx === currentImageIndex ? '#000' : 'rgba(0,0,0,0.2)',
                          transform: idx === currentImageIndex ? 'scale(1.2)' : 'scale(1)'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className={styles.infoSection}>
            <h1 className={styles.title}>{product.name}</h1>
            {product.collection && (
              <p className={`${styles.colorSubtitle} serif-italic`}>
                {product.collection}
              </p>
            )}

            {/* Color variants selector */}
            <div className={styles.variantSection}>
              <p className={styles.variantLabel}>
                Color: <span>{product.color}</span>
              </p>
              {variants.length > 1 && (
                <div className={styles.variantGrid}>
                  {variants.map(v => (
                    <Link href={`/product/${v.id}`} key={v.id} title={v.color}>
                      <div
                        className={styles.variantThumb}
                        style={{
                          border: v.id === product.id ? '2px solid #000' : '1px solid #eaeaea',
                          opacity: v.id === product.id ? 1 : 0.65
                        }}
                      >
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          <Image src={v.image} alt={v.color} fill style={{ objectFit: 'contain' }} sizes="64px" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <p className={styles.price}>{product.price} €</p>
            
            <div className={styles.divider}></div>
            
            <p className={styles.description}>{product.description}</p>

            {product.stock === 1 && (
              <p style={{ color: '#d97706', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px' }}>
                ⚠️ Solo queda 1 unidad disponible de este modelo.
              </p>
            )}
            {product.stock > 1 && remainingStock === 0 && !isSoldOut && (
              <p style={{ color: '#d97706', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px' }}>
                ⚠️ Ya tienes todas las unidades disponibles en tu cesta.
              </p>
            )}

            <button 
              className={`btn-primary ${styles.addToCartBtn}`} 
              onClick={handleAddToCart}
              style={!canAddMore ? { background: '#eaeaea', cursor: 'not-allowed', color: '#888' } : {}}
              disabled={!canAddMore}
            >
              {isSoldOut ? "AGOTADO" : (!canAddMore ? "LÍMITE ALCANZADO" : "AÑADIR A LA CESTA")}
            </button>
          </div>
        </div>

        {/* Recommended Products */}
        <div className={styles.recommendedSection}>
          <h3 className={styles.recommendedTitle}>También te podría gustar</h3>
          <div className={styles.recommendedGrid}>
            {allProducts
              .filter((p: any) => p.id !== product.id)
              .slice(0, 4)
              .map((p: any) => (
                <Link href={`/product/${p.id}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '4/5',
                      backgroundColor: '#fafafa',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      marginBottom: '10px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <Image src={p.image} alt={p.name} fill style={{ objectFit: 'contain', padding: '6px' }} sizes="(max-width: 991px) 50vw, 25vw" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.2 }}>{p.name}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{p.price} €</span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }} className="serif-italic">
                      {p.collection || p.color}
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* Modal: Added to Cart */}
        {added && (
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 100, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              background: '#ffffff',
              padding: '32px 24px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #eee'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <Check size={26} strokeWidth={2.5} />
              </div>
              <h2 style={{ textTransform: 'uppercase', fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#000' }}>
                Añadido a la Cesta
              </h2>
              <p style={{ margin: 0, color: '#666', fontSize: '0.92rem', lineHeight: 1.4 }}>
                Has añadido <strong>{product.name} ({product.color})</strong> exitosamente.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', marginTop: '8px' }}>
                <Link
                  href="/cart"
                  className="btn-primary"
                  style={{
                    display: 'block',
                    padding: '14px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.9rem'
                  }}
                >
                  Ver la Cesta y Pagar
                </Link>
                <button 
                  onClick={() => setAdded(false)} 
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    border: '1px solid #ddd'
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
