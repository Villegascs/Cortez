"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import styles from "./page.module.css";
import { ShieldCheck, Truck, RotateCcw } from "lucide-react";

const products = [
  {
    id: 1,
    name: "cortez aviator",
    color: "Gold & Dark",
    price: 120,
    image: "/images/lente_1_1781241251041.png",
    description: "Diseño clásico y atemporal. Montura metálica ligera y lentes polarizadas para máxima protección."
  },
  {
    id: 2,
    name: "cortez wayfarer",
    color: "Matte Black",
    price: 150,
    image: "/images/lente_2_1781241268932.png",
    description: "El icono reinventado. Acabado mate sofisticado con la más alta tecnología en protección UV."
  },
  {
    id: 3,
    name: "cortez vintage",
    color: "Tortoise",
    price: 110,
    image: "/images/lente_3_1781241285563.png",
    description: "Estilo retro con toques modernos. Patrón tortoise exclusivo hecho a mano."
  },
];

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const product = products.find((p) => p.id === Number(resolvedParams.id));
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1>Producto no encontrado</h1>
        <Link href="/" className="btn-primary">Volver al catálogo</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: `${product.name} - ${product.color}`,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
          <Link href="/cart">Carrito</Link>
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
          >
            {added ? "AÑADIDO A LA CESTA" : "AÑADIR A LA CESTA"}
          </button>
        </div>
      </div>
    </div>
  );
}
