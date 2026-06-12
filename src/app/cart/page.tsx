"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import styles from "./page.module.css";
import { Trash2, ShoppingBag, ChevronDown, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

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
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

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
    
    formData.append("shippingMethod", shippingMethod);
    if (shippingMethod === "DELIVERY_VALENCIA") formData.append("shippingZone", shippingZone);
    if (shippingMethod === "ENVIOS_NACIONALES") formData.append("shippingAgency", shippingAgency);
    
    if (paymentMethod === "PAGO_MOVIL") {
      formData.append("paymentBank", paymentBank);
      formData.append("paymentPhone", paymentPhone);
    }

    let screenshotUrl = "";
    if (paymentFile) {
      try {
        const keyRes = await fetch('/api/upload');
        const keyData = await keyRes.json();
        if (keyData.key) {
          const fd = new FormData();
          fd.append("image", paymentFile);
          const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${keyData.key}`, { method: 'POST', body: fd });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.success) {
            screenshotUrl = uploadData.data.url;
          }
        }
      } catch (e) {
        console.error("Error subiendo captura", e);
      }
    }

    if (screenshotUrl) {
      formData.append("screenshotUrl", screenshotUrl);
    }
    
    formData.append("items", JSON.stringify(items));

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setSuccess(true);
        setOrderDetails({
          items: [...items],
          total: totalUsd,
          customerName: `${firstName} ${lastName}`,
          shippingMethod: shippingMethod
        });
        clearCart();
      } else {
        alert("Hubo un error al procesar el pago");
      }
    } catch (error) {
      alert("Error de conexión");
    }

    setLoading(false);
  };

  const generateWhatsAppLink = () => {
    if (!orderDetails) return "#";
    
    const itemsText = orderDetails.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ");
    const text = `¡Hola Cortez! Acabo de realizar un pedido.\n\n*Cliente:* ${orderDetails.customerName}\n*Pedido:* ${itemsText}\n*Total:* $${orderDetails.total}\n*Método de entrega:* ${orderDetails.shippingMethod}\n\nAdjunto comprobante de pago en la web.`;
    
    return `https://wa.me/584247283924?text=${encodeURIComponent(text)}`;
  };

  if (success) {
    return (
      <div className={styles.container}>
        <Navbar isSuccessPage={true} />
        <div style={{ paddingTop: '75px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={styles.successMessage} style={{ width: '100%', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '15px' }}>¡Pedido Completado!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Hemos recibido tu pedido y el comprobante de pago.</p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>Pronto nos pondremos en contacto contigo.</p>
            
            {/* WhatsApp Button */}
            <a 
              href={generateWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: '#25D366', color: '#fff', padding: '14px 20px', borderRadius: '8px',
                textDecoration: 'none', fontWeight: 600, marginBottom: '30px',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
              }}
            >
              <MessageCircle size={22} />
              Notificar Pago por WhatsApp
            </a>

            {/* Collapsible Order Summary */}
            {orderDetails && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', textAlign: 'left', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div 
                  onClick={() => setIsOrderOpen(!isOrderOpen)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', cursor: 'pointer', background: '#fafafa', borderRadius: '8px 8px 0 0' }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Resumen de Orden</span>
                  <ChevronDown size={20} style={{ color: '#64748b', transform: isOrderOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
                {isOrderOpen && (
                  <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Estatus</span>
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Pendiente</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Cliente</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{orderDetails.customerName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Entrega</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{orderDetails.shippingMethod}</span>
                    </div>
                    <div style={{ paddingTop: '15px', borderTop: '1px dashed #e2e8f0' }}>
                      {orderDetails.items.map((i: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                          <span style={{ color: '#334155' }}>{i.quantity}x {i.name}</span>
                          <span style={{ fontWeight: 500 }}>${i.price * i.quantity}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                        <span>Total</span>
                        <span>${orderDetails.total}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link href="/" className="btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center', padding: '14px' }}>Volver a la tienda</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />

      <div style={{ paddingTop: '100px' }}>

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

              <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '20px'}} disabled={loading}>
                {loading ? "PROCESANDO..." : "PROCEDER AL PAGO"}
              </button>
            </form>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
