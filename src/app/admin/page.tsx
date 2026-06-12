"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowLeft, Save, ExternalLink, Plus, Trash2 } from "lucide-react";

export default function AdminPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [usdtRate, setUsdtRate] = useState<number>(40.5);
  const [loading, setLoading] = useState(true);

  // New product form
  const [newProductName, setNewProductName] = useState("");
  const [newProductColor, setNewProductColor] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newProductImage, setNewProductImage] = useState("");

  const fetchData = async () => {
    try {
      const [resOrders, resSettings, resProducts] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/settings'),
        fetch('/api/products?all=true')
      ]);
      const dataOrders = await resOrders.json();
      const dataSettings = await resSettings.json();
      const dataProducts = await resProducts.json();

      if (dataOrders.orders) setOrders(dataOrders.orders);
      if (dataSettings.rate) setUsdtRate(dataSettings.rate);
      if (dataProducts.products) setProducts(dataProducts.products);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateRate = async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: usdtRate })
      });
      alert("Tasa actualizada correctamente");
    } catch (error) {
      alert("Error actualizando tasa");
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      fetchData(); // refresh
    } catch (error) {
      alert("Error actualizando pedido");
    }
  };

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [extraFiles, setExtraFiles] = useState<FileList | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainImageFile) return alert("Debes subir una imagen principal");
    
    setUploadingFiles(true);
    try {
      // 1. Upload main image
      const mainFormData = new FormData();
      mainFormData.append("image", mainImageFile);
      const resMain = await fetch('/api/upload', { method: 'POST', body: mainFormData });
      const mainData = await resMain.json();
      if (!resMain.ok) throw new Error("Error subiendo imagen principal");

      // 2. Upload extra images
      const extraUrls: string[] = [];
      if (extraFiles) {
        for (let i = 0; i < extraFiles.length; i++) {
          const extraFormData = new FormData();
          extraFormData.append("image", extraFiles[i]);
          const resExtra = await fetch('/api/upload', { method: 'POST', body: extraFormData });
          const extraData = await resExtra.json();
          if (resExtra.ok) extraUrls.push(extraData.url);
        }
      }

      // 3. Create product
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName,
          color: newProductColor,
          price: newProductPrice,
          stock: newProductStock,
          description: newProductDesc,
          image: mainData.url,
          images: JSON.stringify(extraUrls)
        })
      });

      setNewProductName(""); setNewProductColor(""); setNewProductPrice("");
      setNewProductStock(""); setNewProductDesc(""); setMainImageFile(null); setExtraFiles(null);
      fetchData();
    } catch (error) {
      alert("Error añadiendo producto");
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if(!confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert("Error eliminando producto");
    }
  };

  const handleUpdateStock = async (id: number, stock: number) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock })
      });
      fetchData();
    } catch (error) {
      alert("Error actualizando stock");
    }
  };

  const handleToggleVisibility = async (id: number, currentVisible: boolean) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !currentVisible })
      });
      fetchData();
    } catch (error) {
      alert("Error cambiando visibilidad");
    }
  };

  if (loading) return <div>Cargando panel...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            <ArrowLeft size={20} /> Volver a la tienda
          </Link>
          <h1 className={styles.title}>Panel de Administración</h1>
        </div>
        
        <div className={styles.settingsPanel}>
          <div>
            <div className={styles.sectionTitle}>Tasa USDT (Bs)</div>
            <input 
              type="number" step="0.01" className="input-field" 
              value={usdtRate} onChange={(e) => setUsdtRate(Number(e.target.value))} 
              style={{ width: '120px', padding: '10px' }}
            />
          </div>
          <button className="btn-primary" onClick={handleUpdateRate} style={{ marginTop: '20px', padding: '12px' }}>
            <Save size={20} />
          </button>
        </div>
      </div>

      {/* PRODUCT INVENTORY SECTION */}
      <h2 style={{ marginBottom: '20px', textTransform:'uppercase', fontSize: '1.5rem' }}>Inventario de Productos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px', marginBottom: '60px' }}>
        
        {/* ADD PRODUCT */}
        <div style={{ background: 'var(--surface-color)', padding: '20px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '15px', textTransform:'uppercase', fontSize: '1rem' }}>Añadir Lente</h3>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input required placeholder="Nombre (ej. cortez aviator)" className="input-field" value={newProductName} onChange={e=>setNewProductName(e.target.value)} />
            <input required placeholder="Color (ej. Gold & Dark)" className="input-field" value={newProductColor} onChange={e=>setNewProductColor(e.target.value)} />
            <input required type="number" placeholder="Precio ($)" className="input-field" value={newProductPrice} onChange={e=>setNewProductPrice(e.target.value)} />
            <input required type="number" placeholder="Stock" className="input-field" value={newProductStock} onChange={e=>setNewProductStock(e.target.value)} />
            <textarea required placeholder="Descripción" className="input-field" value={newProductDesc} onChange={e=>setNewProductDesc(e.target.value)} />
            
            <div style={{marginTop: '10px'}}>
              <label style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Imagen Principal (Obligatoria)</label>
              <input required type="file" accept="image/*" className="input-field" style={{padding:'5px'}} onChange={e=>setMainImageFile(e.target.files?.[0] || null)} />
            </div>

            <div style={{marginTop: '5px'}}>
              <label style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Galería (Imágenes Extra)</label>
              <input type="file" accept="image/*" multiple className="input-field" style={{padding:'5px'}} onChange={e=>setExtraFiles(e.target.files)} />
            </div>

            <button type="submit" className="btn-primary" style={{marginTop:'10px'}} disabled={uploadingFiles}>
              {uploadingFiles ? "SUBIENDO..." : <><Plus size={18}/> Agregar</>}
            </button>
          </form>
        </div>

        {/* LIST PRODUCTS */}
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000' }}>
                <th style={{ padding: '10px' }}>Producto</th>
                <th style={{ padding: '10px' }}>Precio</th>
                <th style={{ padding: '10px' }}>Stock</th>
                <th style={{ padding: '10px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #ddd', opacity: p.isVisible ? 1 : 0.5 }}>
                  <td style={{ padding: '15px 10px' }}>
                    <strong>{p.name}</strong> {!p.isVisible && <span style={{color:'red', fontSize:'0.7rem', marginLeft:'5px'}}>(OCULTO)</span>}<br/>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>{p.color}</span>
                  </td>
                  <td style={{ padding: '15px 10px' }}>${p.price}</td>
                  <td style={{ padding: '15px 10px' }}>
                    <input 
                      type="number" 
                      value={p.stock} 
                      className="input-field" 
                      style={{ width: '70px', padding: '5px' }}
                      onChange={(e) => handleUpdateStock(p.id, Number(e.target.value))}
                    />
                  </td>
                  <td style={{ padding: '15px 10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => handleToggleVisibility(p.id, p.isVisible)} style={{ color: p.isVisible ? '#000' : '#888', cursor: 'pointer' }} title={p.isVisible ? "Ocultar Lente" : "Mostrar Lente"}>
                      {p.isVisible ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>}
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={{ color: 'red', cursor: 'pointer' }}><Trash2 size={20}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 style={{ marginBottom: '20px', textTransform:'uppercase', fontSize: '1.5rem' }}>Pedidos Recientes</h2>
      {orders.length === 0 ? (
        <p>No hay pedidos registrados.</p>
      ) : (
        <div className={styles.ordersGrid}>
          {orders.map(order => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderId}>Orden #{order.id}</span>
                <span className={`${styles.status} ${styles[order.status]}`}>
                  {order.status === 'PENDING' ? 'PENDIENTE' : order.status === 'ACCEPTED' ? 'ACEPTADO' : 'RECHAZADO'}
                </span>
              </div>
              
              <div className={styles.orderSection}>
                <div className={styles.sectionTitle}>Cliente</div>
                <div className={styles.clientInfo}>
                  {order.firstName} {order.lastName} <br/>
                  <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{order.documentType}-{order.documentNumber}</span>
                </div>
              </div>

              <div className={styles.orderSection}>
                <div className={styles.sectionTitle}>Pago</div>
                <div className={styles.paymentInfo}>
                  <strong>Monto:</strong> ${order.totalUsd} / {order.totalBs} Bs <br/>
                  <strong>Método:</strong> {order.paymentMethod} <br/>
                  {order.paymentMethod === 'PAGO_MOVIL' && (
                    <>
                      <strong>Banco:</strong> {order.paymentBank} <br/>
                      <strong>Teléfono:</strong> {order.paymentPhone} <br/>
                    </>
                  )}
                  <strong>Ref:</strong> {order.paymentReference}
                  <br/>
                  {order.paymentScreenshot && (
                    <a href={order.paymentScreenshot} target="_blank" rel="noreferrer" className={styles.screenshotLink}>
                      <ExternalLink size={16} /> Ver Captura
                    </a>
                  )}
                </div>
              </div>

              {order.status === 'PENDING' && (
                <div className={styles.actionButtons}>
                  <button className={styles.acceptBtn} onClick={() => handleUpdateOrderStatus(order.id, 'ACCEPTED')}>
                    Aceptar
                  </button>
                  <button className={styles.rejectBtn} onClick={() => handleUpdateOrderStatus(order.id, 'REJECTED')}>
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
