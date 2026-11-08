"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import styles from "./page.module.css";
import { ChevronDown, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Combobox from "@/components/Combobox";
import Stepper, { Step } from "@/components/Stepper";

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
  const [currentStep, setCurrentStep] = useState<number>(1);
  
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
    // Fetch live BCV rate from settings API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.rate) setUsdtRate(data.rate);
      })
      .catch(e => console.error(e));
  }, []);

  const subtotalUsd = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalUsd = subtotalUsd + (shippingMethod === "DELIVERY_VALENCIA" ? 3 : 0);
  const totalBs = totalUsd * usdtRate;

  const validateStep1 = () => {
    if (!firstName.trim()) {
      alert("Por favor ingresa tu nombre");
      return false;
    }
    if (!lastName.trim()) {
      alert("Por favor ingresa tu apellido");
      return false;
    }
    if (!docNumber.trim()) {
      alert("Por favor ingresa tu número de cédula");
      return false;
    }
    if (shippingMethod === "DELIVERY_VALENCIA" && !shippingZone) {
      alert("Selecciona una zona de delivery");
      return false;
    }
    if (shippingMethod === "ENVIOS_NACIONALES" && !shippingAgency) {
      alert("Selecciona una agencia de envío");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (paymentMethod === "PAGO_MOVIL") {
      if (!paymentBank) {
        alert("Selecciona tu banco de origen");
        return false;
      }
      if (!paymentPhone.trim()) {
        alert("Ingresa tu teléfono de origen");
        return false;
      }
    }
    if (paymentMethod !== "EFECTIVO" && !paymentRef.trim()) {
      alert("Por favor ingresa la referencia de pago (últimos 4-6 dígitos)");
      return false;
    }
    return true;
  };

  const handleStepChange = (targetStep: number) => {
    if (targetStep > currentStep) {
      if (currentStep === 1 && !validateStep1()) return;
      if (currentStep === 2 && !validateStep2()) return;
    }
    setCurrentStep(targetStep);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

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

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setOrderDetails({
          id: data.orderId,
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
    const trackingLink = `${window.location.origin}/order/${orderDetails.id}`;
    const text = `¡Hola Cortez! Acabo de realizar un pedido.\n\n*Cliente:* ${orderDetails.customerName}\n*Pedido:* ${itemsText}\n*Total:* ${orderDetails.total} USDT\n*Método de entrega:* ${orderDetails.shippingMethod}\n\n*Sigue tu orden aquí:*\n${trackingLink}\n\nAdjunto comprobante de pago en la web.`;
    
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
                          <span style={{ fontWeight: 500 }}>{i.price * i.quantity} USDT</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                        <span>Total</span>
                        <span>{orderDetails.total} USDT</span>
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
                    <Link href={`/product/${item.id}`} style={{ display: 'flex', alignItems: 'center' }}>
                      <Image src={item.image} alt={item.name} width={100} height={120} className={styles.itemImage} style={{objectFit: 'contain', cursor: 'pointer'}}/>
                    </Link>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemHeader}>
                        <Link href={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <span className={styles.itemName} style={{ cursor: 'pointer' }}>{item.name}</span>
                        </Link>
                        <span className={styles.itemPrice}>{item.price} USDT</span>
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
                <span>{subtotalUsd} USDT</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Envío</span>
                <span>{shippingMethod === "DELIVERY_VALENCIA" ? "3 USDT" : "Gratis"}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total</span>
                <div style={{textAlign: 'right'}}>
                  <span>{totalUsd} USDT</span>
                  <span className={styles.bsAmount}>~ {totalBs.toFixed(2)} Bs</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Tasa oficial BCV: {usdtRate.toFixed(2)} Bs
                  </span>
                </div>
              </div>

              {/* Multi-Step Checkout with React Bits Stepper */}
              <div style={{ marginTop: '28px' }}>
                <Stepper
                  step={currentStep}
                  onStepChange={handleStepChange}
                  onFinalStepCompleted={() => handleSubmit()}
                  backButtonText="Atrás"
                  nextButtonText="Continuar"
                  completeButtonText={loading ? "Procesando..." : "Realizar Pedido"}
                  theme="light"
                  accentColor="#000000"
                  frame={false}
                  linear={true}
                  transition="fade"
                  width="100%"
                  nextButtonProps={{
                    disabled: loading
                  }}
                >
                  {/* STEP 1: ENVÍO */}
                  <Step title="Envío">
                    <div style={{ marginTop: '8px' }}>
                      <h3 style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px', letterSpacing: '0.5px' }}>
                        Datos de Entrega
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className={styles.formGroup}>
                          <label>Nombre *</label>
                          <input 
                            required 
                            type="text" 
                            className="input-field" 
                            placeholder="Tu nombre"
                            value={firstName} 
                            onChange={e => setFirstName(e.target.value)} 
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Apellido *</label>
                          <input 
                            required 
                            type="text" 
                            className="input-field" 
                            placeholder="Tu apellido"
                            value={lastName} 
                            onChange={e => setLastName(e.target.value)} 
                          />
                        </div>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Cédula de Identidad *</label>
                        <div className={styles.documentGroup}>
                          <select className="input-field" style={{width: '80px', flexShrink: 0}} value={docType} onChange={e => setDocType(e.target.value)}>
                            <option value="V">V</option>
                            <option value="E">E</option>
                            <option value="P">P</option>
                            <option value="J">J</option>
                          </select>
                          <input 
                            required 
                            type="text" 
                            className="input-field" 
                            placeholder="Número de cédula"
                            value={docNumber} 
                            onChange={e => setDocNumber(e.target.value)} 
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Método de Entrega *</label>
                        <Combobox
                          value={shippingMethod}
                          onChange={setShippingMethod}
                          options={[
                            { value: "PICKUP", label: "Pick Up (Retiro en oficina)" },
                            { value: "DELIVERY_VALENCIA", label: "Delivery (Valencia) +3 USDT" },
                            { value: "ENVIOS_NACIONALES", label: "Envío Nacional (MRW/Zoom/Tealca)" }
                          ]}
                          placeholder="Selecciona método"
                          searchPlaceholder="Buscar método..."
                        />
                      </div>

                      {shippingMethod === "DELIVERY_VALENCIA" && (
                        <div className={styles.formGroup}>
                          <label>Zona de Delivery (Valencia) *</label>
                          <Combobox
                            value={shippingZone}
                            onChange={setShippingZone}
                            options={[
                              { value: "El Bosque", label: "El Bosque" },
                              { value: "Naguanagua", label: "Naguanagua" },
                              { value: "La Viña", label: "La Viña" },
                              { value: "El Viñedo", label: "El Viñedo" },
                              { value: "Prebo", label: "Prebo" },
                              { value: "San Diego", label: "San Diego" },
                              { value: "Centro", label: "Centro" }
                            ]}
                            placeholder="Selecciona una zona"
                            searchPlaceholder="Buscar zona..."
                          />
                        </div>
                      )}

                      {shippingMethod === "ENVIOS_NACIONALES" && (
                        <div className={styles.formGroup}>
                          <label>Agencia de Envío *</label>
                          <Combobox
                            value={shippingAgency}
                            onChange={setShippingAgency}
                            options={[
                              { value: "MRW", label: "MRW" },
                              { value: "Zoom", label: "Zoom" },
                              { value: "Tealca", label: "Tealca" },
                              { value: "Domesa", label: "Domesa" }
                            ]}
                            placeholder="Selecciona una agencia"
                            searchPlaceholder="Buscar agencia..."
                          />
                        </div>
                      )}
                    </div>
                  </Step>

                  {/* STEP 2: PAGO */}
                  <Step title="Pago">
                    <div style={{ marginTop: '8px' }}>
                      <h3 style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px', letterSpacing: '0.5px' }}>
                        Método de Pago
                      </h3>

                      <div className={styles.formGroup}>
                        <label>Selecciona cómo deseas pagar</label>
                        <Combobox
                          value={paymentMethod}
                          onChange={setPaymentMethod}
                          options={[
                            { value: "PAGO_MOVIL", label: "Pago Móvil" },
                            { value: "EFECTIVO", label: "Efectivo (SOLO VALENCIA)" },
                            { value: "BINANCE", label: "Binance Pay" }
                          ]}
                          placeholder="Selecciona método de pago"
                          searchPlaceholder="Buscar método..."
                        />
                      </div>

                      {paymentMethod === "PAGO_MOVIL" && (
                        <>
                          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.85rem', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ fontWeight: 600 }}>Datos para Pago Móvil:</span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Toca para copiar</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>Banco:</span>
                                <strong onClick={() => { navigator.clipboard.writeText('Bancamiga'); alert('Banco copiado: Bancamiga'); }} style={{ cursor: 'pointer', background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }} title="Copiar">Bancamiga 📋</strong>
                              </p>
                              <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>Cédula:</span>
                                <strong onClick={() => { navigator.clipboard.writeText('27241528'); alert('Cédula copiada: 27241528'); }} style={{ cursor: 'pointer', background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }} title="Copiar">27241528 📋</strong>
                              </p>
                              <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>Teléfono:</span>
                                <strong onClick={() => { navigator.clipboard.writeText('04247283924'); alert('Teléfono copiado: 04247283924'); }} style={{ cursor: 'pointer', background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }} title="Copiar">04247283924 📋</strong>
                              </p>
                            </div>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label>Banco Origen *</label>
                            <Combobox
                              value={paymentBank}
                              onChange={setPaymentBank}
                              options={VENEZUELAN_BANKS.map(b => ({ value: b, label: b }))}
                              placeholder="Selecciona un banco"
                              searchPlaceholder="Buscar banco..."
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label>Teléfono Origen *</label>
                            <input 
                              required 
                              type="text" 
                              className="input-field" 
                              placeholder="Ej: 04141234567" 
                              value={paymentPhone} 
                              onChange={e => setPaymentPhone(e.target.value)} 
                            />
                          </div>
                        </>
                      )}

                      {paymentMethod === "BINANCE" && (
                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.85rem', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                          <p style={{ fontWeight: 600, marginBottom: '8px' }}>Datos para Binance Pay:</p>
                          <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748b' }}>Binance ID:</span>
                            <strong onClick={() => { navigator.clipboard.writeText('201174382'); alert('Binance ID copiado: 201174382'); }} style={{ cursor: 'pointer', background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }} title="Copiar">201174382 📋</strong>
                          </p>
                        </div>
                      )}

                      {paymentMethod !== "EFECTIVO" && (
                        <>
                          <div className={styles.formGroup}>
                            <label>Referencia de Pago * (Últimos 4-6 dígitos)</label>
                            <input 
                              required 
                              type="text" 
                              className="input-field" 
                              placeholder="Ej: 948210"
                              value={paymentRef} 
                              onChange={e => setPaymentRef(e.target.value)} 
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label>Captura de Pago (Opcional)</label>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="input-field" 
                              style={{ padding: '8px' }} 
                              onChange={e => {
                                if (e.target.files && e.target.files[0]) setPaymentFile(e.target.files[0]);
                              }} 
                            />
                            {paymentFile && (
                              <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px' }}>
                                ✓ {paymentFile.name}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </Step>

                  {/* STEP 3: REVISAR & CONFIRMAR */}
                  <Step title="Revisar">
                    <div style={{ marginTop: '8px' }}>
                      <h3 style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px', letterSpacing: '0.5px' }}>
                        Resumen del Pedido
                      </h3>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ color: '#64748b' }}>Cliente:</span>
                          <strong style={{ color: '#0f172a' }}>{firstName} {lastName} ({docType}-{docNumber})</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ color: '#64748b' }}>Entrega:</span>
                          <strong style={{ color: '#0f172a' }}>
                            {shippingMethod === "PICKUP" && "Pick Up (Oficina)"}
                            {shippingMethod === "DELIVERY_VALENCIA" && `Delivery (${shippingZone || 'Valencia'})`}
                            {shippingMethod === "ENVIOS_NACIONALES" && `Envío Nal (${shippingAgency})`}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ color: '#64748b' }}>Pago:</span>
                          <strong style={{ color: '#0f172a' }}>
                            {paymentMethod === "PAGO_MOVIL" && "Pago Móvil"}
                            {paymentMethod === "BINANCE" && "Binance Pay"}
                            {paymentMethod === "EFECTIVO" && "Efectivo"}
                          </strong>
                        </div>
                        {paymentRef && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ color: '#64748b' }}>Referencia:</span>
                            <strong style={{ color: '#0f172a' }}>{paymentRef}</strong>
                          </div>
                        )}
                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>Monto a Transferir:</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>{totalUsd} USDT</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>~ {totalBs.toFixed(2)} Bs</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '16px', padding: '12px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '0.8rem', color: '#1e40af' }}>
                        ℹ Al pulsar <strong>"Realizar Pedido"</strong>, procesaremos tu orden y podrás confirmar el pago directamente vía WhatsApp.
                      </div>
                    </div>
                  </Step>
                </Stepper>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
