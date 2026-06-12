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
  const [newProductCategory, setNewProductCategory] = useState("UNISEX");
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
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);

  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [existingMainImage, setExistingMainImage] = useState("");
  const [existingExtraImages, setExistingExtraImages] = useState<string[]>([]);

  const handleEdit = (p: any) => {
    setEditId(p.id);
    setNewProductName(p.name);
    setNewProductColor(p.color);
    setNewProductPrice(p.price.toString());
    setNewProductStock(p.stock.toString());
    setNewProductDesc(p.description);
    setNewProductCategory(p.category || "UNISEX");
    setExistingMainImage(p.image);
    setExistingExtraImages(JSON.parse(p.images || "[]"));
    setMainImageFile(null);
    setExtraFiles(null);
    setMainImagePreview("");
    setExtraPreviews([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setNewProductName(""); setNewProductColor(""); setNewProductPrice("");
    setNewProductStock(""); setNewProductDesc(""); setNewProductCategory("UNISEX"); 
    setMainImageFile(null); setExtraFiles(null);
    setMainImagePreview(""); setExtraPreviews([]);
    setExistingMainImage(""); setExistingExtraImages([]);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId && !mainImageFile) return alert("Debes subir una imagen principal");
    
    setUploadingFiles(true);
    try {
      // Get API Key from server
      const keyRes = await fetch('/api/upload');
      const keyData = await keyRes.json();
      if (!keyData.key) throw new Error("API Key de ImgBB no encontrada en Vercel.");
      const apiKey = keyData.key;

      const uploadToImgBB = async (file: File) => {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error?.message || "Error de ImgBB");
        return data.data.url;
      };

      // 1. Upload main image
      let mainImageUrl = existingMainImage;
      if (mainImageFile) {
        mainImageUrl = await uploadToImgBB(mainImageFile);
      }

      // 2. Upload extra images
      const extraUrls: string[] = [...existingExtraImages];
      if (extraFiles) {
        for (let i = 0; i < extraFiles.length; i++) {
          extraUrls.push(await uploadToImgBB(extraFiles[i]));
        }
      }

      // 3. Create or update product
      const productRes = await fetch(editId ? `/api/products/${editId}` : '/api/products', {
        method: editId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName,
          color: newProductColor,
          price: newProductPrice,
          stock: newProductStock,
          description: newProductDesc,
          category: newProductCategory,
          image: mainImageUrl,
          images: JSON.stringify(extraUrls)
        })
      });
      if (!productRes.ok) throw new Error("Error guardando el producto en la base de datos.");

      handleCancelEdit();
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert(`Error añadiendo producto: ${error.message || error}`);
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
        
        {/* ADD / EDIT PRODUCT */}
        <div style={{ background: 'var(--surface-color)', padding: '20px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '15px', textTransform:'uppercase', fontSize: '1rem' }}>{editId ? "Editar Lente" : "Añadir Lente"}</h3>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input required placeholder="Nombre (ej. cortez aviator)" className="input-field" value={newProductName} onChange={e=>setNewProductName(e.target.value)} />
            <input required placeholder="Color (ej. Gold & Dark)" className="input-field" value={newProductColor} onChange={e=>setNewProductColor(e.target.value)} />
            <input required type="number" placeholder="Precio ($)" className="input-field" value={newProductPrice} onChange={e=>setNewProductPrice(e.target.value)} />
            <input required type="number" placeholder="Stock" className="input-field" value={newProductStock} onChange={e=>setNewProductStock(e.target.value)} />
            <select className="input-field" value={newProductCategory} onChange={e=>setNewProductCategory(e.target.value)}>
              <option value="UNISEX">Unisex</option>
              <option value="HOMBRES">Hombres</option>
              <option value="MUJERES">Mujeres</option>
            </select>
            <textarea required placeholder="Descripción" className="input-field" value={newProductDesc} onChange={e=>setNewProductDesc(e.target.value)} />
            
            <div style={{marginTop: '10px'}}>
              <label style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Imagen Principal {!editId && "(Obligatoria)"}</label>
              {existingMainImage && !mainImagePreview && <div style={{marginBottom: '5px'}}><img src={existingMainImage} width={50} height={50} style={{objectFit:'cover'}} /></div>}
              {mainImagePreview && <div style={{marginBottom: '5px'}}><img src={mainImagePreview} width={50} height={50} style={{objectFit:'cover'}} /></div>}
              <input required={!editId} type="file" accept="image/*" className="input-field" style={{padding:'5px'}} onChange={e=>{
                const file = e.target.files?.[0];
                if(file){
                  setMainImageFile(file);
                  setMainImagePreview(URL.createObjectURL(file));
                }
              }} />
            </div>

            <div style={{marginTop: '5px'}}>
              <label style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Galería (Imágenes Extra)</label>
              {existingExtraImages.length > 0 && extraPreviews.length === 0 && (
                <div style={{display:'flex', gap:'5px', marginBottom:'5px', flexWrap:'wrap'}}>
                  {existingExtraImages.map((url, i) => <img key={i} src={url} width={40} height={40} style={{objectFit:'cover'}} />)}
                  <span style={{fontSize:'0.7rem', color:'red', cursor:'pointer'}} onClick={() => setExistingExtraImages([])}>[Borrar Todas]</span>
                </div>
              )}
              {extraPreviews.length > 0 && (
                <div style={{display:'flex', gap:'5px', marginBottom:'5px', flexWrap:'wrap'}}>
                  {extraPreviews.map((url, i) => <img key={i} src={url} width={40} height={40} style={{objectFit:'cover'}} />)}
                </div>
              )}
              <input type="file" accept="image/*" multiple className="input-field" style={{padding:'5px'}} onChange={e=>{
                const files = e.target.files;
                if(files){
                  setExtraFiles(files);
                  setExtraPreviews(Array.from(files).map(f => URL.createObjectURL(f)));
                }
              }} />
            </div>

            <button type="submit" className="btn-primary" style={{marginTop:'10px'}} disabled={uploadingFiles}>
              {uploadingFiles ? "GUARDANDO..." : <><Save size={18}/> {editId ? "Guardar Cambios" : "Agregar"}</>}
            </button>
            {editId && (
              <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                Cancelar
              </button>
            )}
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
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>{p.color} - {p.category}</span>
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
                    <button onClick={() => handleEdit(p)} style={{ color: '#000', cursor: 'pointer' }} title="Editar Lente">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button onClick={() => handleToggleVisibility(p.id, p.isVisible)} style={{ color: p.isVisible ? '#000' : '#888', cursor: 'pointer' }} title={p.isVisible ? "Ocultar Lente" : "Mostrar Lente"}>
                      {p.isVisible ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>}
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)} style={{ color: 'red', cursor: 'pointer' }} title="Eliminar Lente"><Trash2 size={20}/></button>
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
