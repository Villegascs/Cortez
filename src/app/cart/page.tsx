"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import styles from "./page.module.css";
import { ChevronDown, MessageCircle, ShoppingBag, Trash2, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
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
  "Exterior",
  "Bancamiga"
];

// Función para convertir imágenes a WebP en el navegador y reducir 95% el peso
async function convertToWebP(file: File): Promise<File> {
  if (typeof window === 'undefined') return file;
  
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const maxDim = 1200;
      let { width, height } = img;
      
      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const cleanName = file.name.replace(/\.[^.]+$/, '') + '.webp';
            const webpFile = new File([blob], cleanName, {
              type: 'image/webp',
              lastModified: Date.now()
            });
            resolve(webpFile);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        0.8
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    
    img.src = url;
  });
}

export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();
  const [usdtRate, setUsdtRate] = useState<number>(1004.95);
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
  const [uploadedScreenshotUrl, setUploadedScreenshotUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const rawFile = e.target.files[0];
    
    setUploadingImage(true);
    try {
      // 1. Conversión ultra rápida a WebP (reduce hasta un 95% el peso)
      const webpFile = await convertToWebP(rawFile);
      setPaymentFile(webpFile);

      // 2. Pre-subida inmediata en segundo plano para que al presionar 'Realizar Pedido' sea instantáneo
      const keyRes = await fetch('/api/upload');
      const keyData = await keyRes.json();
      if (keyData.key) {
        const fd = new FormData();
        fd.append("image", webpFile);
        const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${keyData.key}`, {
          method: 'POST',
          body: fd
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success) {
          setUploadedScreenshotUrl(uploadData.data.url);
        }
      }
    } catch (err) {
      console.warn("Error en pre-subida de comprobante:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const [shippingMethod, setShippingMethod] = useState("PICKUP");
  const [shippingZone, setShippingZone] = useState("");
  const [shippingAgency, setShippingAgency] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  // Custom Modal with Blur Backdrop
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'warning' | 'info' | 'success' | 'error';
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "warning"
  });

  const showAlert = (message: string, title = "Aviso", type: 'warning' | 'info' | 'success' | 'error' = 'warning') => {
    setModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    showAlert(`${label} copiado al portapapeles: ${text}`, "Copiado con Éxito", "success");
  };

  useEffect(() => {
    // Fetch live BCV rate from settings API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.rate) setUsdtRate(data.rate);
      })
      .catch(e => console.error(e));
  }, []);

  const subtotalEur = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCostEur = shippingMethod === "DELIVERY_VALENCIA" ? 3 : 0;
  const totalEur = subtotalEur + shippingCostEur;
  const totalBs = totalEur * usdtRate;

  // Validaciones
  const validateStep2Billing = () => {
    if (!firstName.trim()) {
      showAlert("Por favor ingresa tu nombre para continuar con la facturación y entrega.", "Nombre Requerido", "warning");
      return false;
    }
    if (!lastName.trim()) {
      showAlert("Por favor ingresa tu apellido para continuar con la facturación y entrega.", "Apellido Requerido", "warning");
      return false;
    }
    if (!docNumber.trim()) {
      showAlert("Por favor ingresa tu número de cédula de identidad.", "Cédula Requerida", "warning");
      return false;
    }
    if (shippingMethod === "DELIVERY_VALENCIA" && !shippingZone) {
      showAlert("Selecciona tu zona de delivery en Valencia para poder llevarte el pedido.", "Zona Requerida", "warning");
      return false;
    }
    if (shippingMethod === "ENVIOS_NACIONALES" && !shippingAgency) {
      showAlert("Selecciona la agencia de envío nacional por la cual deseas recibir (MRW, Zoom, Tealca o Domesa).", "Agencia Requerida", "warning");
      return false;
    }
    return true;
  };

  const validateStep3Payment = () => {
    if (paymentMethod === "PAGO_MOVIL") {
      if (!paymentBank) {
        showAlert("Por favor selecciona tu banco de origen para validar la transferencia.", "Banco Requerido", "warning");
        return false;
      }
      if (!paymentPhone.trim()) {
        showAlert("Ingresa el número de teléfono desde donde realizaste el Pago Móvil.", "Teléfono Requerido", "warning");
        return false;
      }
    }
    if (paymentMethod !== "EFECTIVO" && !paymentRef.trim()) {
      showAlert("Por favor ingresa los últimos 4-6 dígitos del número de referencia de tu pago.", "Referencia Requerida", "warning");
      return false;
    }
    return true;
  };

  const handleStepChange = (targetStep: number) => {
    if (targetStep > currentStep) {
      if (currentStep === 1 && items.length === 0) {
        showAlert("Tu cesta está vacía. Añade productos antes de continuar.", "Cesta Vacía", "warning");
        return;
      }
      if (currentStep === 2 && !validateStep2Billing()) return;
      if (currentStep === 3 && !validateStep3Payment()) return;
    }
    setCurrentStep(targetStep);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (items.length === 0) {
      showAlert("Tu cesta está vacía. Añade productos antes de procesar el pedido.", "Cesta Vacía", "warning");
      return;
    }
    if (!validateStep2Billing()) {
      setCurrentStep(2);
      return;
    }
    if (!validateStep3Payment()) {
      setCurrentStep(3);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("documentType", docType);
    formData.append("documentNumber", docNumber);
    formData.append("paymentMethod", paymentMethod);
    formData.append("paymentReference", paymentRef || "EFECTIVO_ENTREGA");
    formData.append("totalUsd", totalEur.toString());
    formData.append("totalBs", totalBs.toString());
    
    formData.append("shippingMethod", shippingMethod);
    if (shippingMethod === "DELIVERY_VALENCIA") formData.append("shippingZone", shippingZone);
    if (shippingMethod === "ENVIOS_NACIONALES") formData.append("shippingAgency", shippingAgency);
    
    if (paymentMethod === "PAGO_MOVIL") {
      formData.append("paymentBank", paymentBank);
      formData.append("paymentPhone", paymentPhone);
    }

    let screenshotUrl = uploadedScreenshotUrl;
    // Si aún no ha terminado de subir en segundo plano pero hay archivo, subirlo de inmediato
    if (!screenshotUrl && paymentFile) {
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
      } catch (err) {
        console.warn("Error subiendo captura en checkout", err);
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
          total: totalEur,
          customerName: `${firstName} ${lastName}`,
          shippingMethod: shippingMethod
        });
        clearCart();
      } else {
        showAlert("Hubo un error al procesar el pedido. Intenta nuevamente.", "Error al Procesar", "error");
      }
    } catch (err) {
      showAlert("Error de conexión al procesar el pedido. Verifica tu conexión a internet.", "Error de Conexión", "error");
    }

    setLoading(false);
  };

  const generateWhatsAppLink = () => {
    if (!orderDetails) return "#";
    
    const itemsText = orderDetails.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ");
    const trackingLink = `${window.location.origin}/order/${orderDetails.id}`;
    const text = `¡Hola Cortez! Acabo de realizar un pedido.\n\n*Cliente:* ${orderDetails.customerName}\n*Pedido:* ${itemsText}\n*Total:* ${orderDetails.total} €\n*Método de entrega:* ${orderDetails.shippingMethod}\n\n*Sigue tu orden aquí:*\n${trackingLink}\n\nAdjunto comprobante de pago en la web.`;
    
    return `https://wa.me/584247283924?text=${encodeURIComponent(text)}`;
  };

  if (success) {
    return (
      <div className={styles.container}>
        <Navbar isSuccessPage={true} />
        <div style={{ paddingTop: '75px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={styles.successMessage} style={{ width: '100%', maxWidth: '520px', margin: '0 auto', textAlign: 'center', background: '#fff', padding: '40px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CheckCircle2 size={56} color="#16a34a" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ marginBottom: '10px', fontSize: '1.6rem', color: '#0f172a' }}>¡Pedido Completado!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Hemos recibido tu orden y registrado los datos.</p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '0.9rem' }}>Pulsa el botón a continuación para notificar el pago a nuestro WhatsApp oficial.</p>
            
            {/* WhatsApp Button */}
            <a 
              href={generateWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: '#25D366', color: '#fff', padding: '14px 20px', borderRadius: '8px',
                textDecoration: 'none', fontWeight: 600, marginBottom: '25px',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
              }}
            >
              <MessageCircle size={22} />
              Notificar Pago por WhatsApp
            </a>

            {/* Collapsible Order Summary */}
            {orderDetails && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fafafa', textAlign: 'left', marginBottom: '25px' }}>
                <div 
                  onClick={() => setIsOrderOpen(!isOrderOpen)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer' }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Detalle de la Orden</span>
                  <ChevronDown size={18} style={{ color: '#64748b', transform: isOrderOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
                {isOrderOpen && (
                  <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b' }}>Estatus</span>
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>PENDIENTE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b' }}>Cliente</span>
                      <span style={{ fontWeight: 500 }}>{orderDetails.customerName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b' }}>Entrega</span>
                      <span style={{ fontWeight: 500 }}>{orderDetails.shippingMethod}</span>
                    </div>
                    <div style={{ paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                      {orderDetails.items.map((i: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                          <span style={{ color: '#334155' }}>{i.quantity}x {i.name}</span>
                          <span style={{ fontWeight: 500 }}>{i.price * i.quantity} €</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                        <span>Total</span>
                        <span>{orderDetails.total} €</span>
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

      <div style={{ paddingTop: '90px' }}>
        <div className={styles.centeredWrapper}>
          <h1 className={styles.title}>Proceso de Compra</h1>

          <div className={styles.checkoutPanel}>
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
              transition="slide"
              width="100%"
              nextButtonProps={{
                disabled: loading || (currentStep === 1 && items.length === 0)
              }}
            >
              {/* ========================================================= */}
              {/* PASO 1: PEDIDO (Los productos que estén en el carrito) */}
              {/* ========================================================= */}
              <Step title="Pedido" description="Artículos en cesta">
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                      1. Tu Pedido ({items.length} {items.length === 1 ? 'artículo' : 'artículos'})
                    </h3>
                  </div>

                  {items.length === 0 ? (
                    <div className={styles.emptyCart}>
                      <ShoppingBag size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                      <p style={{ fontWeight: 500, fontSize: '1rem', color: '#0f172a' }}>Tu cesta está vacía</p>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', marginBottom: '20px' }}>
                        Agrega los lentes que desees comprar para continuar con el pedido.
                      </p>
                      <Link href="/" className="btn-primary" style={{ display: 'inline-block', padding: '10px 24px' }}>
                        Descubrir colección
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className={styles.cartItems}>
                        {items.map(item => (
                          <div key={item.id} className={styles.cartItem}>
                            <Link href={`/product/${item.id}`} style={{ display: 'flex', alignItems: 'center' }}>
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                width={80} 
                                height={80} 
                                className={styles.itemImage} 
                                style={{ objectFit: 'contain', cursor: 'pointer' }}
                              />
                            </Link>
                            <div className={styles.itemInfo}>
                              <div className={styles.itemHeader}>
                                <Link href={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                  <span className={styles.itemName}>{item.name}</span>
                                </Link>
                                <span className={styles.itemPrice}>{item.price} €</span>
                              </div>
                              <div className={styles.itemActions}>
                                <span>Cantidad: <strong>{item.quantity}</strong></span>
                                <button 
                                  type="button"
                                  className={styles.removeBtn} 
                                  onClick={() => removeItem(item.id)}
                                  title="Quitar producto"
                                >
                                  <Trash2 size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                  Quitar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Resumen de costos del paso 1 */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                          <span style={{ color: '#64748b' }}>Subtotal productos:</span>
                          <span style={{ fontWeight: 600 }}>{subtotalEur} €</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                          <span style={{ color: '#64748b' }}>Envío estimado:</span>
                          <span style={{ fontWeight: 600 }}>
                            {shippingMethod === "DELIVERY_VALENCIA" ? "3 €" : "Gratis"}
                          </span>
                        </div>
                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Total estimado:</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>{totalEur} €</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                              ~ {totalBs.toFixed(2)} Bs
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px' }}>
                              Tasa oficial BCV (Euro): {usdtRate.toFixed(2)} Bs/€
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Step>

              {/* ========================================================= */}
              {/* PASO 2: DATOS PARA LA FACTURACIÓN (Y ENTREGA) */}
              {/* ========================================================= */}
              <Step title="Facturación" description="Nombre y Cédula">
                <div style={{ marginTop: '12px' }}>
                  <h3 style={{ textTransform: 'uppercase', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.5px' }}>
                    2. Datos para la Facturación y Entrega
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className={styles.formGroup}>
                      <label>Nombre *</label>
                      <input 
                        required 
                        type="text" 
                        className="input-field" 
                        placeholder="Solo letras"
                        value={firstName} 
                        onChange={e => {
                          const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                          setFirstName(val);
                        }} 
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Apellido *</label>
                      <input 
                        required 
                        type="text" 
                        className="input-field" 
                        placeholder="Solo letras"
                        value={lastName} 
                        onChange={e => {
                          const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                          setLastName(val);
                        }} 
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Cédula de Identidad *</label>
                    <div className={styles.documentGroup}>
                      <select className="input-field" style={{ width: '80px', flexShrink: 0 }} value={docType} onChange={e => setDocType(e.target.value)}>
                        <option value="V">V</option>
                        <option value="E">E</option>
                        <option value="P">P</option>
                        <option value="J">J</option>
                      </select>
                      <input 
                        required 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="input-field" 
                        placeholder="Solo números (ej. 28419502)"
                        value={docNumber} 
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, "");
                          setDocNumber(val);
                        }} 
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label style={{ marginBottom: '10px' }}>Selecciona tu Método de Entrega *</label>
                    
                    {/* Tarjetas interactivas de método de entrega */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                      {/* Opción 1: Pick Up */}
                      <div 
                        onClick={() => setShippingMethod('PICKUP')}
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          border: shippingMethod === 'PICKUP' ? '2px solid #000' : '1px solid #e2e8f0',
                          background: shippingMethod === 'PICKUP' ? '#0f172a' : '#fff',
                          color: shippingMethod === 'PICKUP' ? '#fff' : '#0f172a',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          boxShadow: shippingMethod === 'PICKUP' ? '0 4px 12px rgba(0,0,0,0.12)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>🏢 Pick Up</span>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 700, 
                            background: shippingMethod === 'PICKUP' ? '#22c55e' : '#f1f5f9', 
                            color: shippingMethod === 'PICKUP' ? '#fff' : '#166534', 
                            padding: '2px 8px', 
                            borderRadius: '10px' 
                          }}>
                            Gratis
                          </span>
                        </div>
                        <span style={{ fontSize: '0.76rem', opacity: 0.85 }}>Retiro en oficina (Valencia)</span>
                      </div>

                      {/* Opción 2: Delivery Valencia */}
                      <div 
                        onClick={() => setShippingMethod('DELIVERY_VALENCIA')}
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          border: shippingMethod === 'DELIVERY_VALENCIA' ? '2px solid #000' : '1px solid #e2e8f0',
                          background: shippingMethod === 'DELIVERY_VALENCIA' ? '#0f172a' : '#fff',
                          color: shippingMethod === 'DELIVERY_VALENCIA' ? '#fff' : '#0f172a',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          boxShadow: shippingMethod === 'DELIVERY_VALENCIA' ? '0 4px 12px rgba(0,0,0,0.12)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>🛵 Delivery</span>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 700, 
                            background: shippingMethod === 'DELIVERY_VALENCIA' ? '#38bdf8' : '#f1f5f9', 
                            color: shippingMethod === 'DELIVERY_VALENCIA' ? '#0f172a' : '#0369a1', 
                            padding: '2px 8px', 
                            borderRadius: '10px' 
                          }}>
                            +3 €
                          </span>
                        </div>
                        <span style={{ fontSize: '0.76rem', opacity: 0.85 }}>En zonas de Valencia</span>
                      </div>

                      {/* Opción 3: Envío Nacional */}
                      <div 
                        onClick={() => setShippingMethod('ENVIOS_NACIONALES')}
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          border: shippingMethod === 'ENVIOS_NACIONALES' ? '2px solid #000' : '1px solid #e2e8f0',
                          background: shippingMethod === 'ENVIOS_NACIONALES' ? '#0f172a' : '#fff',
                          color: shippingMethod === 'ENVIOS_NACIONALES' ? '#fff' : '#0f172a',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          boxShadow: shippingMethod === 'ENVIOS_NACIONALES' ? '0 4px 12px rgba(0,0,0,0.12)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>📦 Envío Nacional</span>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: 700, 
                            background: shippingMethod === 'ENVIOS_NACIONALES' ? '#f59e0b' : '#f1f5f9', 
                            color: shippingMethod === 'ENVIOS_NACIONALES' ? '#fff' : '#b45309', 
                            padding: '2px 8px', 
                            borderRadius: '10px' 
                          }}>
                            C.O.D.
                          </span>
                        </div>
                        <span style={{ fontSize: '0.76rem', opacity: 0.85 }}>Cobro a destino en agencia</span>
                      </div>
                    </div>

                    {/* Sub-opción Pick Up: información de oficina */}
                    {shippingMethod === "PICKUP" && (
                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#334155', animation: 'fadeIn 0.25s ease' }}>
                        📍 <strong>Punto de Retiro:</strong> Oficina Cortez en Valencia. Coordinaremos el horario contigo directamente por WhatsApp tras confirmar el pedido.
                      </div>
                    )}

                    {/* Sub-opción Delivery Valencia: selector de zona nativo sin cortes */}
                    {shippingMethod === "DELIVERY_VALENCIA" && (
                      <div style={{ marginTop: '14px', animation: 'fadeIn 0.25s ease' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                          Zona de Delivery en Valencia *
                        </label>
                        <select
                          required
                          className="input-field"
                          value={shippingZone}
                          onChange={e => setShippingZone(e.target.value)}
                          style={{ width: '100%', cursor: 'pointer', height: '42px' }}
                        >
                          <option value="">-- Selecciona tu zona de entrega --</option>
                          <option value="El Bosque">El Bosque</option>
                          <option value="Naguanagua">Naguanagua</option>
                          <option value="La Viña">La Viña</option>
                          <option value="El Viñedo">El Viñedo</option>
                          <option value="Prebo">Prebo</option>
                          <option value="San Diego">San Diego</option>
                          <option value="Centro">Centro de Valencia</option>
                        </select>
                      </div>
                    )}

                    {/* Sub-opción Envío Nacional: selector de agencias */}
                    {shippingMethod === "ENVIOS_NACIONALES" && (
                      <div style={{ marginTop: '14px', animation: 'fadeIn 0.25s ease' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                          Selecciona la Agencia de Envío *
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          {["MRW", "Zoom", "Tealca", "Domesa"].map(agency => (
                            <button
                              key={agency}
                              type="button"
                              onClick={() => setShippingAgency(agency)}
                              style={{
                                padding: '10px 4px',
                                borderRadius: '8px',
                                border: shippingAgency === agency ? '2px solid #000' : '1px solid #cbd5e1',
                                background: shippingAgency === agency ? '#0f172a' : '#fff',
                                color: shippingAgency === agency ? '#fff' : '#0f172a',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              {agency}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Step>

              {/* ========================================================= */}
              {/* PASO 3: MÉTODO DE PAGO (Seleccionable: Pago Móvil, Efectivo, Binance) */}
              {/* ========================================================= */}
              <Step title="Pago" description="Método de pago">
                <div style={{ marginTop: '12px' }}>
                  <h3 style={{ textTransform: 'uppercase', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', letterSpacing: '0.5px' }}>
                    3. Selecciona tu Método de Pago
                  </h3>

                  {/* Selector visual de método de pago */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PAGO_MOVIL')}
                      style={{
                        padding: '14px 10px',
                        border: paymentMethod === 'PAGO_MOVIL' ? '2px solid #000' : '1px solid #e2e8f0',
                        background: paymentMethod === 'PAGO_MOVIL' ? '#0f172a' : '#fff',
                        color: paymentMethod === 'PAGO_MOVIL' ? '#fff' : '#0f172a',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        boxShadow: paymentMethod === 'PAGO_MOVIL' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>📱</div>
                      Pago Móvil
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('EFECTIVO')}
                      style={{
                        padding: '14px 10px',
                        border: paymentMethod === 'EFECTIVO' ? '2px solid #000' : '1px solid #e2e8f0',
                        background: paymentMethod === 'EFECTIVO' ? '#0f172a' : '#fff',
                        color: paymentMethod === 'EFECTIVO' ? '#fff' : '#0f172a',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        boxShadow: paymentMethod === 'EFECTIVO' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>💵</div>
                      Efectivo
                      <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.8, marginTop: '2px' }}>
                        (Solo Valencia)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('BINANCE')}
                      style={{
                        padding: '14px 10px',
                        border: paymentMethod === 'BINANCE' ? '2px solid #000' : '1px solid #e2e8f0',
                        background: paymentMethod === 'BINANCE' ? '#0f172a' : '#fff',
                        color: paymentMethod === 'BINANCE' ? '#fff' : '#0f172a',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        boxShadow: paymentMethod === 'BINANCE' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🟡</div>
                      Binance Pay
                    </button>
                  </div>

                  {/* CASO 1: PAGO MÓVIL */}
                  {paymentMethod === "PAGO_MOVIL" && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '18px', fontSize: '0.85rem', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Datos para transferir Pago Móvil:</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Toca para copiar</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748b' }}>Banco destino:</span>
                            <strong onClick={() => copyToClipboard('Bancamiga', 'Banco')} style={{ cursor: 'pointer', background: '#fff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} title="Copiar">Bancamiga 📋</strong>
                          </p>
                          <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748b' }}>Cédula:</span>
                            <strong onClick={() => copyToClipboard('27241528', 'Cédula')} style={{ cursor: 'pointer', background: '#fff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} title="Copiar">27241528 📋</strong>
                          </p>
                          <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748b' }}>Teléfono:</span>
                            <strong onClick={() => copyToClipboard('04247283924', 'Teléfono')} style={{ cursor: 'pointer', background: '#fff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} title="Copiar">04247283924 📋</strong>
                          </p>
                          <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                            <span style={{ color: '#64748b' }}>Monto exacto en Bs:</span>
                            <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{totalBs.toFixed(2)} Bs</strong>
                          </p>
                        </div>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Banco Origen *</label>
                        <select
                          required
                          className="input-field"
                          value={paymentBank}
                          onChange={e => setPaymentBank(e.target.value)}
                          style={{ width: '100%', cursor: 'pointer', height: '42px' }}
                        >
                          <option value="">-- Selecciona el banco desde donde pagas --</option>
                          {VENEZUELAN_BANKS.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Teléfono Origen *</label>
                        <input 
                          required 
                          type="text" 
                          inputMode="tel"
                          className="input-field" 
                          placeholder="Ej: 04141234567" 
                          value={paymentPhone} 
                          onChange={e => {
                            const val = e.target.value.replace(/[^\d+]/g, "");
                            setPaymentPhone(val);
                          }} 
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Número de Referencia * (Últimos 4-6 dígitos)</label>
                        <input 
                          required 
                          type="text" 
                          className="input-field" 
                          placeholder="Ej: 849201"
                          value={paymentRef} 
                          onChange={e => setPaymentRef(e.target.value)} 
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Captura de Pago (Opcional - Se optimiza a WebP automáticamente)</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="input-field" 
                          style={{ padding: '8px' }} 
                          onChange={handleFileSelect} 
                        />
                        {uploadingImage && (
                          <p style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            ⚡ Convirtiendo a WebP y precargando comprobante...
                          </p>
                        )}
                        {!uploadingImage && paymentFile && (
                          <p style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '6px', fontWeight: 500 }}>
                            ✓ {paymentFile.name} ({Math.round(paymentFile.size / 1024)} KB) - Listo para envío ultrarrápido
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CASO 2: EFECTIVO */}
                  {paymentMethod === "EFECTIVO" && (
                    <div style={{ animation: 'fadeIn 0.3s ease', background: '#f0fdf4', padding: '20px', borderRadius: '10px', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 700, fontSize: '1rem' }}>
                        <span>💵 Pago en Efectivo (Solo Valencia)</span>
                      </div>
                      <p style={{ lineHeight: 1.5, marginBottom: '12px' }}>
                        Pagarás el monto exacto de <strong>{totalEur} €</strong> (o su equivalente en divisas/Bs) al momento de retirar en oficina o al recibir tu pedido vía delivery en Valencia.
                      </p>
                      <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                        ✓ No necesitas comprobante bancario para este método.
                      </p>
                    </div>
                  )}

                  {/* CASO 3: BINANCE PAY */}
                  {paymentMethod === "BINANCE" && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <div style={{ background: '#fefce8', padding: '16px', borderRadius: '10px', marginBottom: '18px', fontSize: '0.85rem', border: '1px solid #fef08a', color: '#854d0e' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Datos para Binance Pay:</span>
                          <span style={{ fontSize: '0.72rem' }}>Toca para copiar</span>
                        </div>
                        <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Binance ID (Pay):</span>
                          <strong onClick={() => copyToClipboard('201174382', 'Binance ID')} style={{ cursor: 'pointer', background: '#fff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #fef08a' }} title="Copiar">201174382 📋</strong>
                        </p>
                        <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px dashed #fef08a', paddingTop: '8px' }}>
                          <span>Monto exacto:</span>
                          <strong style={{ fontSize: '0.95rem' }}>{totalEur} USDT / €</strong>
                        </p>
                      </div>

                      <div className={styles.formGroup}>
                        <label>ID de Transacción / Referencia Binance *</label>
                        <input 
                          required 
                          type="text" 
                          className="input-field" 
                          placeholder="Ej: 39482019482"
                          value={paymentRef} 
                          onChange={e => setPaymentRef(e.target.value)} 
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Captura de Pago (Opcional - Se optimiza a WebP automáticamente)</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="input-field" 
                          style={{ padding: '8px' }} 
                          onChange={handleFileSelect} 
                        />
                        {uploadingImage && (
                          <p style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            ⚡ Convirtiendo a WebP y precargando comprobante...
                          </p>
                        )}
                        {!uploadingImage && paymentFile && (
                          <p style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '6px', fontWeight: 500 }}>
                            ✓ {paymentFile.name} ({Math.round(paymentFile.size / 1024)} KB) - Listo para envío ultrarrápido
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Step>

              {/* ========================================================= */}
              {/* PASO 4: REVISAR TODOS LOS DATOS DE LA ORDEN */}
              {/* ========================================================= */}
              <Step title="Revisar" description="Confirmar pedido">
                <div style={{ marginTop: '12px' }}>
                  <h3 style={{ textTransform: 'uppercase', fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.5px' }}>
                    4. Revisar Todos los Datos de la Orden
                  </h3>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', fontSize: '0.88rem' }}>
                    {/* Artículos */}
                    <div style={{ marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                        Artículos en la orden:
                      </span>
                      <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {items.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span style={{ color: '#0f172a' }}>{it.quantity}x {it.name}</span>
                            <span style={{ fontWeight: 600 }}>{it.price * it.quantity} €</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Cliente / Facturación:</span>
                        <strong style={{ color: '#0f172a' }}>{firstName} {lastName} ({docType}-{docNumber})</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Método de entrega:</span>
                        <strong style={{ color: '#0f172a' }}>
                          {shippingMethod === "PICKUP" && "Pick Up (Retiro en oficina)"}
                          {shippingMethod === "DELIVERY_VALENCIA" && `Delivery (${shippingZone || 'Valencia'})`}
                          {shippingMethod === "ENVIOS_NACIONALES" && `Envío Nacional (${shippingAgency})`}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Método de pago:</span>
                        <strong style={{ color: '#0f172a' }}>
                          {paymentMethod === "PAGO_MOVIL" && "Pago Móvil"}
                          {paymentMethod === "BINANCE" && "Binance Pay"}
                          {paymentMethod === "EFECTIVO" && "Efectivo (Entrega en Valencia)"}
                        </strong>
                      </div>
                      {paymentRef && paymentMethod !== "EFECTIVO" && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Referencia registrada:</span>
                          <strong style={{ color: '#0f172a' }}>{paymentRef}</strong>
                        </div>
                      )}
                    </div>

                    {/* Total a pagar */}
                    <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '14px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>Monto Total a Pagar:</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#0f172a' }}>{totalEur} €</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                          ~ {totalBs.toFixed(2)} Bs
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px' }}>
                          Tasa oficial BCV (Euro): {usdtRate.toFixed(2)} Bs/€
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', padding: '14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.82rem', color: '#1e40af', lineHeight: 1.4 }}>
                    ℹ Al pulsar <strong>"Realizar Pedido"</strong>, registraremos tu orden y podrás enviar el comprobante o consultar tu pedido directamente vía WhatsApp.
                  </div>
                </div>
              </Step>
            </Stepper>
          </div>
        </div>
      </div>

      {/* Modal elegante con fondo borroso blur */}
      {modal.isOpen && (
        <div 
          className={styles.modalBackdrop}
          onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
        >
          <div 
            className={styles.modalCard}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: modal.type === 'success' ? '#dcfce7' : (modal.type === 'error' ? '#fee2e2' : '#fef3c7'),
              color: modal.type === 'success' ? '#16a34a' : (modal.type === 'error' ? '#ef4444' : '#d97706'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              {modal.type === 'success' ? (
                <CheckCircle2 size={30} strokeWidth={2.2} />
              ) : modal.type === 'error' ? (
                <AlertCircle size={30} strokeWidth={2.2} />
              ) : (
                <AlertTriangle size={30} strokeWidth={2.2} />
              )}
            </div>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: '8px',
              letterSpacing: '-0.3px'
            }}>
              {modal.title}
            </h3>

            <p style={{
              fontSize: '0.92rem',
              color: '#64748b',
              lineHeight: 1.5,
              marginBottom: '24px'
            }}>
              {modal.message}
            </p>

            <button
              type="button"
              onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
