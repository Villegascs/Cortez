"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import styles from "./page.module.css";
import { Trash2, ShoppingBag } from "lucide-react";

const VENEZUELAN_BANKS = [
  "Banesco",
  "Mercantil",
  "Provincial",
  "Venezuela",
  "BNC",
  "Bancaribe",
  "Exterior"
];

export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();
  const [usdtRate, setUsdtRate] = useState<number>(40.5);
  
  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [docType, setDocType] = useState("V");
  const [docNumber, setDocNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PAGO_MOVIL");
  const [paymentBank, setPaymentBank] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch live rate
    fetch('/api/settings').then(res => res.json()).then(data => {
      if(data.rate) setUsdtRate(data.rate);
    }).catch(e => console.error(e));
  }, []);

  const totalUsd = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalBs = totalUsd * usdtRate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("documentType", docType);
    formData.append("documentNumber", docNumber);
    formData.append("paymentMethod", paymentMethod);
    formData.append("paymentReference", paymentRef);
    formData.append("totalUsd", totalUsd.toString());
    formData.append("totalBs", totalBs.toString());
    
    if (paymentMethod === "PAGO_MOVIL") {
      formData.append("paymentBank", paymentBank);
      formData.append("paymentPhone", paymentPhone);
    }

    if (paymentFile) {
      formData.append("screenshot", paymentFile);
    }
    
    formData.append("items", JSON.stringify(items));

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setSuccess(true);
        clearCart();
      } else {
        alert("Hubo un error al procesar el pago");
      }
    } catch (error) {
      alert("Error de conexión");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className={styles.container}>
        <nav className={styles.navbar}>
          <div className={styles.logo}><Link href="/">Cortez</Link></div>
        </nav>
        <div className={styles.successMessage}>
          <h2>¡Pedido Completado!</h2>
          <p>Hemos recibido tu pedido y el comprobante de pago.</p>
          <p>Pronto nos pondremos en contacto contigo.</p>
          <br/>
          <Link href="/" className="btn-primary">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        ENVÍOS GRATIS A PARTIR DE $100 — PAGO MÓVIL, ZELLE Y BINANCE DISPONIBLES
      </div>

      <nav className={styles.navbar}>
        <div><Link href="/">Colección</Link></div>
        <div className={styles.logo}><Link href="/">Cortez</Link></div>
        <div className={styles.cartIcon}>
          <Link href="/cart" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span style={{fontSize: '0.8rem'}}>{items.length}</span>
          </Link>
        </div>
      </nav>

      <div className={styles.cartWrapper}>
        <div>
          <h1 className={styles.title}>Tu Cesta</h1>
          
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>Tu cesta está vacía</p>
              <br/>
              <Link href="/" className="btn-primary">Descubrir colección</Link>
            </div>
          ) : (
            <div className={styles.cartItems}>
              {items.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <Image src={item.image} alt={item.name} width={100} height={120} className={styles.itemImage} style={{objectFit: 'cover'}}/>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemPrice}>${item.price}</span>
                    </div>
                    <div className={styles.itemActions}>
                      <span>Cant: {item.quantity}</span>
                      <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.checkoutPanel}>
            <h2 style={{textTransform:'uppercase', fontSize: '1.2rem', marginBottom: '20px'}}>Resumen</h2>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${totalUsd}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Envío</span>
              <span>Gratis</span>
            </div>
            <div className={styles.totalRow}>
              <span>Total</span>
              <div style={{textAlign: 'right'}}>
                <span>${totalUsd}</span>
                <span className={styles.bsAmount}>~ {totalBs.toFixed(2)} Bs (Tasa: {usdtRate})</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{marginTop: '30px'}}>
              <h3 style={{textTransform:'uppercase', fontSize: '1rem', marginBottom: '15px'}}>Datos de Envío y Facturación</h3>
              
              <div className={styles.formGroup}>
                <label>Nombre</label>
                <input required type="text" className="input-field" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Apellido</label>
                <input required type="text" className="input-field" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              
              <div className={styles.formGroup}>
                <label>Cédula de Identidad</label>
                <div className={styles.documentGroup}>
                  <select className="input-field" style={{width: '80px'}} value={docType} onChange={e => setDocType(e.target.value)}>
                    <option value="V">V</option>
                    <option value="E">E</option>
                    <option value="P">P</option>
                    <option value="J">J</option>
                  </select>
                  <input required type="text" className="input-field" value={docNumber} onChange={e => setDocNumber(e.target.value)} />
                </div>
              </div>

              <h3 style={{textTransform:'uppercase', fontSize: '1rem', marginBottom: '15px', marginTop: '30px'}}>Pago</h3>
              
              <div className={styles.formGroup}>
                <label>Método de Pago</label>
                <select className="input-field" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="PAGO_MOVIL">Pago Móvil</option>
                  <option value="ZELLE">Zelle</option>
                  <option value="BINANCE">Binance Pay</option>
                </select>
              </div>

              {paymentMethod === "PAGO_MOVIL" && (
                <>
                  <div className={styles.formGroup}>
                    <label>Banco Origen</label>
                    <select required className="input-field" value={paymentBank} onChange={e => setPaymentBank(e.target.value)}>
                      <option value="">Selecciona un banco</option>
                      {VENEZUELAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Teléfono Origen</label>
                    <input required type="text" className="input-field" placeholder="04141234567" value={paymentPhone} onChange={e => setPaymentPhone(e.target.value)} />
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label>Referencia (Últimos 4-6 dígitos)</label>
                <input required type="text" className="input-field" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} />
              </div>

              <div className={styles.formGroup}>
                <label>Captura de Pago (Opcional)</label>
                <input type="file" accept="image/*" className="input-field" style={{padding: '10px'}} onChange={e => {
                  if(e.target.files && e.target.files[0]) setPaymentFile(e.target.files[0]);
                }} />
              </div>

              <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '20px'}} disabled={loading}>
                {loading ? "PROCESANDO..." : "PROCEDER AL PAGO"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
