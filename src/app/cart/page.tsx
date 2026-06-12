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

  const [shippingMethod, setShippingMethod] = useState("PICKUP");
  const [shippingZone, setShippingZone] = useState("");
  const [shippingAgency, setShippingAgency] = useState("");

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
    setClientItems(items);
    fetch('/api/settings').then(res=>res.json()).then(data => {
      if(data.settings) setUsdtRate(data.settings.usdtRate);
    });
  }, [items]);

  const handleNextStep = () => {
    if (step === 1 && clientItems.length > 0) setStep(2);
    else if (step === 2) {
      if(!firstName || !lastName || !docNumber) return alert("Llena tus datos personales");
      if(shippingMethod === "DELIVERY_VALENCIA" && !shippingZone) return alert("Selecciona la zona de delivery");
      if(shippingMethod === "ENVIOS_NACIONALES" && !shippingAgency) return alert("Selecciona la agencia de envíos");
      setStep(3);
    }
  };

  const handleSubmitOrder = async () => {
    if(!paymentRef && paymentMethod !== "ZELLE") return alert("Ingresa el número de referencia");
    if(paymentMethod === "ZELLE" && !paymentFile) return alert("Sube el comprobante de Zelle");

    setSubmitting(true);

    let screenshotUrl = "";
    if (paymentFile) {
      try {
        const keyRes = await fetch('/api/upload');
        const keyData = await keyRes.json();
        if (keyData.key) {
          const fd = new FormData();
          fd.append("image", paymentFile);
          const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${keyData.key}`, {
            method: 'POST',
            body: fd
          });
          const uploadData = await uploadRes.json();
          if (uploadData.data && uploadData.data.url) {
            screenshotUrl = uploadData.data.url;
          }
        }
      } catch (error) {
        console.error("Error subiendo pago:", error);
      }
    }

    const payload = {
      firstName, lastName, documentType: docType, documentNumber: docNumber,
      paymentMethod, paymentBank, paymentPhone, paymentDestDocument: paymentDestDoc,
      paymentReference: paymentRef,
      paymentScreenshot: screenshotUrl,
      shippingMethod, shippingZone, shippingAgency,
      items: clientItems,
      totalUsd: getTotal(),
      totalBs: getTotal() * usdtRate
    };

    const res = await fetch('/api/checkout', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    
    setSubmitting(false);
    if(res.ok) {
      setSuccess(true);
      clearCart();
    } else {
      alert("Error procesando orden");
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <Navbar isSuccessPage={true} />
        <div style={{ paddingTop: '75px' }}>
          <div className={styles.successMessage}>
            <h2>¡Pedido Completado!</h2>
            <p>Gracias por tu compra. Te contactaremos pronto para confirmar el envío.</p>
            <Link href="/" className="btn-primary">Volver a la tienda</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        ENVÍOS GRATIS A PARTIR DE $100 — PAGO MÓVIL, ZELLE Y BINANCE DISPONIBLES
      </div>

      <Navbar />

      <div style={{ paddingTop: '75px' }}>

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

              <div className={styles.formGroup}>
                <label>Método de Entrega</label>
                <select className="input-field" value={shippingMethod} onChange={e => setShippingMethod(e.target.value)}>
                  <option value="PICKUP">Pick Up (Retiro en oficina)</option>
                  <option value="DELIVERY_VALENCIA">Delivery (Valencia)</option>
                  <option value="ENVIOS_NACIONALES">Envío Nacional (MRW/Zoom/Tealca)</option>
                </select>
              </div>

              {shippingMethod === "DELIVERY_VALENCIA" && (
                <div className={styles.formGroup}>
                  <label>Zona de Delivery (Valencia)</label>
                  <select required className="input-field" value={shippingZone} onChange={e => setShippingZone(e.target.value)}>
                    <option value="">Selecciona una zona</option>
                    <option value="El Bosque">El Bosque</option>
                    <option value="Naguanagua">Naguanagua</option>
                    <option value="La Viña">La Viña</option>
                    <option value="El Viñedo">El Viñedo</option>
                    <option value="Prebo">Prebo</option>
                    <option value="San Diego">San Diego</option>
                    <option value="Centro">Centro</option>
                  </select>
                </div>
              )}

              {shippingMethod === "ENVIOS_NACIONALES" && (
                <div className={styles.formGroup}>
                  <label>Agencia de Envío</label>
                  <select required className="input-field" value={shippingAgency} onChange={e => setShippingAgency(e.target.value)}>
                    <option value="">Selecciona una agencia</option>
                    <option value="MRW">MRW</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Tealca">Tealca</option>
                    <option value="Domesa">Domesa</option>
                  </select>
                </div>
              )}

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

              <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '20px'}} disabled={submitting}>
                {submitting ? "PROCESANDO..." : "PROCEDER AL PAGO"}
              </button>
            </form>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
