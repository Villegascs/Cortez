"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowLeft, Save, ExternalLink, Plus, Trash2, LogOut, ChevronsUpDown, Check, Search, RefreshCw, Eye, EyeOff, Edit3, UploadCloud, Image as ImageIcon, ImagePlus, X, RefreshCcw } from "lucide-react";

export default function AdminPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [usdtRate, setUsdtRate] = useState<number>(40.5);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'INVENTARIO' | 'PRODUCTOS' | 'PEDIDOS'>('PEDIDOS');
  const [showArchived, setShowArchived] = useState(false);
  
  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // New product form
  const [newProductName, setNewProductName] = useState("");
  const [newProductColor, setNewProductColor] = useState("");
  const [newProductCollection, setNewProductCollection] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("LENTES");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const CATEGORIES = ["LENTES", "ACCESORIOS"];

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
    if (localStorage.getItem("admin_logged_in") === "true") {
      setIsLoggedIn(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === "CactusDude" && loginPass === "Teammora00cortez") {
      setIsLoggedIn(true);
      setLoginError(false);
      localStorage.setItem("admin_logged_in", "true");
      setLoading(true);
      fetchData();
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    setIsLoggedIn(false);
    setShowLogoutModal(false);
    setLoginUser("");
    setLoginPass("");
  };

  const [syncingRate, setSyncingRate] = useState(false);

  const handleSyncBcv = async () => {
    setSyncingRate(true);
    try {
      const res = await fetch('/api/settings?refresh=true');
      const data = await res.json();
      if (data.rate) {
        setUsdtRate(data.rate);
        alert(`Tasa oficial del BCV (Euro) sincronizada: ${data.rate} Bs`);
      }
    } catch (e) {
      alert("Error al sincronizar con el BCV");
    } finally {
      setSyncingRate(false);
    }
  };

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

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);

  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [existingMainImage, setExistingMainImage] = useState("");
  const [existingExtraImages, setExistingExtraImages] = useState<string[]>([]);

  const handleExtraFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map(f => URL.createObjectURL(f));
      setExtraFiles(prev => [...prev, ...newFiles]);
      setExtraPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveNewExtra = (index: number) => {
    setExtraFiles(prev => prev.filter((_, i) => i !== index));
    setExtraPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingExtra = (index: number) => {
    setExistingExtraImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (p: any) => {
    setEditId(p.id);
    setNewProductName(p.name);
    setNewProductColor(p.color);
    setNewProductCollection(p.collection || "");
    setNewProductPrice(p.price.toString());
    setNewProductStock(p.stock.toString());
    setNewProductDesc(p.description);
    setNewProductCategory(p.category || "UNISEX");
    setExistingMainImage(p.image);
    setExistingExtraImages(JSON.parse(p.images || "[]"));
    setMainImageFile(null);
    setExtraFiles([]);
    setMainImagePreview("");
    setExtraPreviews([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setNewProductName(""); setNewProductColor(""); setNewProductCollection(""); setNewProductPrice("");
    setNewProductStock(""); setNewProductDesc(""); setNewProductCategory("UNISEX"); 
    setMainImageFile(null); setExtraFiles([]);
    setMainImagePreview(""); setExtraPreviews([]);
    setExistingMainImage(""); setExistingExtraImages([]);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId && !mainImageFile) return alert("Debes subir una imagen principal");
    
    setUploadingFiles(true);
    try {
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

      let mainImageUrl = existingMainImage;
      if (mainImageFile) {
        mainImageUrl = await uploadToImgBB(mainImageFile);
      }

      const extraUrls: string[] = [...existingExtraImages];
      if (extraFiles && extraFiles.length > 0) {
        for (let i = 0; i < extraFiles.length; i++) {
          extraUrls.push(await uploadToImgBB(extraFiles[i]));
        }
      }

      const productRes = await fetch(editId ? `/api/products/${editId}` : '/api/products', {
        method: editId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName,
          color: newProductColor,
          collection: newProductCollection,
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
    setProductToDelete(id);
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete === null) return;
    try {
      await fetch(`/api/products/${productToDelete}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert("Error eliminando producto");
    } finally {
      setProductToDelete(null);
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

  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (error) {
      alert("Error actualizando estado de la orden");
    }
  };

  if (loading) {
    return (
      <div className={styles.adminRoot} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Cargando panel de administración...</div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className={styles.adminRoot} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--admin-card-bg)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid var(--admin-card-border)',
          overflow: 'hidden',
          color: 'var(--admin-text)'
        }}>
          <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--admin-card-border)' }}>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--admin-text)' }}>Iniciar Sesión</h2>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--admin-text-muted)' }}>
              Ingresa tus credenciales para administrar Cortez.
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--admin-text)' }}>Usuario</label>
                  <input 
                    type="text" 
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className={styles.adminInput}
                    style={{ width: '100%' }}
                    placeholder="Usuario administrador"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--admin-text)' }}>Contraseña</label>
                  <input 
                    type="password" 
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className={styles.adminInput}
                    style={{ width: '100%' }}
                    placeholder="Contraseña"
                  />
                </div>
                {loginError && (
                  <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>
                    Usuario o contraseña incorrectos.
                  </div>
                )}
              </div>
            </div>
            <div style={{ padding: '16px 24px', background: 'var(--admin-header-bg)', borderTop: '1px solid var(--admin-card-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: 'var(--admin-text)',
                  color: 'var(--admin-bg)',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  letterSpacing: '0.5px'
                }}
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // MAIN ADMIN PANEL
  return (
    <div className={styles.adminRoot}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--admin-text-muted)', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 500 }}>
              <ArrowLeft size={18} /> Volver a la tienda
            </Link>
            <h1 className={styles.title}>Panel de Administración</h1>
          </div>
          
          <button 
            onClick={() => setShowLogoutModal(true)} 
            style={{
              padding: '10px 18px',
              background: '#fee2e2',
              color: '#ef4444',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              fontSize: '0.88rem'
            }}
            title="Cerrar Sesión"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabsContainer}>
          <button 
            type="button"
            onClick={() => setActiveTab('PEDIDOS')}
            className={`${styles.tabButton} ${activeTab === 'PEDIDOS' ? styles.tabButtonActive : ''}`}
          >
            Pedidos ({orders.filter(o => o.status !== 'ARCHIVED').length})
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('INVENTARIO')}
            className={`${styles.tabButton} ${activeTab === 'INVENTARIO' ? styles.tabButtonActive : ''}`}
          >
            Inventario
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('PRODUCTOS')}
            className={`${styles.tabButton} ${activeTab === 'PRODUCTOS' ? styles.tabButtonActive : ''}`}
          >
            Productos ({products.length})
          </button>
        </div>

        {/* TAB 1: INVENTARIO */}
        {activeTab === 'INVENTARIO' && (
          <div>
            <h2 style={{ marginBottom: '20px', textTransform:'uppercase', fontSize: '1.4rem', fontWeight: 700, color: 'var(--admin-text)' }}>
              Gestión de Stock
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Lente</th>
                    <th style={{ textAlign: 'center' }}>Stock Actual</th>
                    <th>Visibilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={{ opacity: p.isVisible ? 1 : 0.6 }}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '6px', background: 'var(--admin-header-bg)', border: '1px solid var(--admin-card-border)' }} 
                        />
                        <div>
                          <strong style={{ fontSize: '0.98rem', color: 'var(--admin-text)' }}>{p.name}</strong> 
                          {!p.isVisible && <span style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: 700, marginLeft: '6px' }}>(OCULTO)</span>}
                          <br/>
                          <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>{p.color} - {p.category}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="number" 
                          value={p.stock} 
                          className={styles.adminInput} 
                          style={{ width: '80px', padding: '6px', textAlign: 'center', fontWeight: 700 }}
                          onChange={(e) => handleUpdateStock(p.id, Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <button 
                          onClick={() => handleToggleVisibility(p.id, p.isVisible)} 
                          style={{
                            color: p.isVisible ? '#10b981' : 'var(--admin-text-muted)',
                            cursor: 'pointer',
                            border: '1px solid var(--admin-card-border)',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: 'var(--admin-card-bg)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}
                        >
                          {p.isVisible ? (
                            <><Eye size={16} /> Visible</>
                          ) : (
                            <><EyeOff size={16} /> Oculto</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTOS */}
        {activeTab === 'PRODUCTOS' && (
          <div>
            <h2 style={{ marginBottom: '20px', textTransform:'uppercase', fontSize: '1.4rem', fontWeight: 700, color: 'var(--admin-text)' }}>
              Base de Datos de Lentes
            </h2>
            <div className={styles.productManagerLayout}>
          
              {/* Form Add / Edit */}
              <div style={{
                background: 'var(--admin-card-bg)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid var(--admin-card-border)',
                height: 'fit-content'
              }}>
                <h3 style={{ marginBottom: '16px', textTransform:'uppercase', fontSize: '0.95rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                  {editId ? "Editar Lente" : "Añadir Lente"}
                </h3>
                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required placeholder="Nombre (ej. cortez aviator)" className={styles.adminInput} value={newProductName} onChange={e=>setNewProductName(e.target.value)} />
                  <input placeholder="Color (Opcional, ej. Gold & Dark)" className={styles.adminInput} value={newProductColor} onChange={e=>setNewProductColor(e.target.value)} />
                  <input placeholder="Colección (Opcional, ej. Weird & Cool)" className={styles.adminInput} value={newProductCollection} onChange={e=>setNewProductCollection(e.target.value)} />
                  <input required type="number" placeholder="Precio (€)" className={styles.adminInput} value={newProductPrice} onChange={e=>setNewProductPrice(e.target.value)} />
                  <input required type="number" placeholder="Stock" className={styles.adminInput} value={newProductStock} onChange={e=>setNewProductStock(e.target.value)} />
                  
                  {/* Category dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setCategoryOpen(!categoryOpen)}
                      className={styles.adminInput}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', cursor: 'pointer', textAlign: 'left',
                        fontWeight: 500
                      }}
                    >
                      <span>{newProductCategory ? newProductCategory : "Seleccionar categoría..."}</span>
                      <ChevronsUpDown size={16} opacity={0.6} />
                    </button>
                    {categoryOpen && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '4px',
                        background: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-card-border)',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                        zIndex: 50, overflow: 'hidden'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--admin-card-border)' }}>
                          <Search size={16} opacity={0.5} style={{ marginRight: '8px' }} />
                          <input 
                            placeholder="Buscar categoría..." 
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            style={{
                              border: 'none',
                              outline: 'none',
                              width: '100%',
                              fontSize: '0.875rem',
                              background: 'transparent',
                              color: 'var(--admin-input-text)'
                            }}
                          />
                        </div>
                        <div style={{ padding: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                          {CATEGORIES.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase())).map(cat => (
                            <div 
                              key={cat}
                              onClick={() => { setNewProductCategory(cat); setCategoryOpen(false); setCategorySearch(""); }}
                              style={{
                                display: 'flex', alignItems: 'center', padding: '8px 10px',
                                borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
                                color: 'var(--admin-text)',
                                background: newProductCategory === cat ? 'var(--admin-header-bg)' : 'transparent'
                              }}
                            >
                              <Check size={16} style={{ marginRight: '8px', opacity: newProductCategory === cat ? 1 : 0 }} />
                              {cat}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <textarea placeholder="Descripción (Opcional)" className={styles.adminInput} style={{ minHeight: '80px', resize: 'vertical' }} value={newProductDesc} onChange={e=>setNewProductDesc(e.target.value)} />
                  
                  {/* Images upload section */}
                  <div className={styles.photoUploadSection}>
                    <div className={styles.photoSectionHeader}>
                      <div className={styles.photoSectionTitle}>
                        <ImageIcon size={16} />
                        Fotografías del Producto
                      </div>
                    </div>

                    {/* Foto Principal */}
                    <div className={styles.photoUploadBox}>
                      <div className={styles.photoUploadLabel}>
                        <span>Foto Principal</span>
                        {!editId && <span className={styles.photoBadgeRequired}>Obligatoria</span>}
                        {editId && <span className={styles.photoBadgeOptional}>Requerida</span>}
                      </div>

                      {(mainImagePreview || existingMainImage) ? (
                        <div className={styles.mainPreviewCard}>
                          <div className={styles.mainPreviewImgWrapper}>
                            <img
                              src={mainImagePreview || existingMainImage}
                              alt="Foto Principal"
                              className={styles.mainPreviewImg}
                            />
                          </div>
                          <div className={styles.mainPreviewInfo}>
                            <span className={styles.mainPreviewBadge}>
                              <Check size={14} /> {mainImagePreview ? "Foto nueva seleccionada" : "Foto guardada"}
                            </span>
                            <div className={styles.mainPreviewActions}>
                              <label htmlFor="main-image-upload" className={styles.photoActionBtn}>
                                <RefreshCcw size={13} />
                                Cambiar
                              </label>
                              {mainImagePreview && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMainImageFile(null);
                                    setMainImagePreview("");
                                  }}
                                  className={`${styles.photoActionBtn} ${styles.photoActionBtnDanger}`}
                                >
                                  <X size={13} />
                                  Deshacer
                                </button>
                              )}
                            </div>
                          </div>
                          <input
                            id="main-image-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setMainImageFile(file);
                                setMainImagePreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div>
                          <label htmlFor="main-image-upload" className={styles.dropzoneCard}>
                            <div className={styles.dropzoneIconWrapper}>
                              <UploadCloud size={22} />
                            </div>
                            <span className={styles.dropzonePrompt}>Subir Foto Principal</span>
                            <span className={styles.dropzoneHint}>Haz clic aquí para seleccionar imagen</span>
                          </label>
                          <input
                            id="main-image-upload"
                            required={!editId}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setMainImageFile(file);
                                setMainImagePreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Galería Secundaria */}
                    <div className={styles.photoUploadBox}>
                      <div className={styles.photoUploadLabel}>
                        <span>Galería Secundaria</span>
                        <span className={styles.photoBadgeOptional}>
                          {existingExtraImages.length + extraPreviews.length} foto(s)
                        </span>
                      </div>

                      <div className={styles.galleryGrid}>
                        {/* Fotos existentes guardadas */}
                        {existingExtraImages.map((url, i) => (
                          <div key={`existing-${i}`} className={styles.galleryItem} title="Foto guardada en galería">
                            <img src={url} alt={`Galería guardada ${i + 1}`} />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingExtra(i)}
                              className={styles.galleryRemoveBtn}
                              title="Eliminar esta foto"
                              aria-label="Eliminar foto"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}

                        {/* Fotos nuevas seleccionadas */}
                        {extraPreviews.map((url, i) => (
                          <div key={`new-${i}`} className={styles.galleryItem} title="Foto nueva por subir">
                            <img src={url} alt={`Galería nueva ${i + 1}`} />
                            <button
                              type="button"
                              onClick={() => handleRemoveNewExtra(i)}
                              className={styles.galleryRemoveBtn}
                              title="Quitar esta foto"
                              aria-label="Quitar foto"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}

                        {/* Botón para añadir fotos */}
                        <label htmlFor="gallery-images-upload" className={styles.galleryAddBtn} title="Añadir más fotos a la galería">
                          <ImagePlus size={20} />
                          <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>Añadir</span>
                        </label>
                      </div>

                      <input
                        id="gallery-images-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleExtraFilesChange}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    style={{
                      marginTop: '10px',
                      padding: '12px',
                      background: 'var(--admin-text)',
                      color: 'var(--admin-bg)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }} 
                    disabled={uploadingFiles}
                  >
                    {uploadingFiles ? "GUARDANDO..." : <><Save size={18}/> {editId ? "Guardar Cambios" : "Agregar Lente"}</>}
                  </button>
                  {editId && (
                    <button 
                      type="button" 
                      onClick={handleCancelEdit}
                      style={{
                        padding: '10px',
                        background: 'transparent',
                        color: 'var(--admin-text)',
                        border: '1px solid var(--admin-card-border)',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancelar Edición
                    </button>
                  )}
                </form>
              </div>

              {/* Products Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} style={{ opacity: p.isVisible ? 1 : 0.6 }}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', background: 'var(--admin-header-bg)', border: '1px solid var(--admin-card-border)' }} />
                          <div>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--admin-text)' }}>{p.name}</strong> 
                            {!p.isVisible && <span style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: 700, marginLeft: '6px' }}>(OCULTO)</span>}
                            <br/>
                            <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>{p.color} - {p.category}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{p.price} €</td>
                        <td>
                          <input 
                            type="number" 
                            value={p.stock} 
                            className={styles.adminInput} 
                            style={{ width: '70px', padding: '6px', textAlign: 'center', fontWeight: 700 }}
                            onChange={(e) => handleUpdateStock(p.id, Number(e.target.value))}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                              onClick={() => handleEdit(p)} 
                              style={{ color: 'var(--admin-text)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px' }} 
                              title="Editar Lente"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              onClick={() => handleToggleVisibility(p.id, p.isVisible)} 
                              style={{ color: p.isVisible ? '#10b981' : 'var(--admin-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px' }} 
                              title={p.isVisible ? "Ocultar Lente" : "Mostrar Lente"}
                            >
                              {p.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(p.id)} 
                              style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px' }} 
                              title="Eliminar Lente"
                            >
                              <Trash2 size={18}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PEDIDOS */}
        {activeTab === 'PEDIDOS' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ textTransform:'uppercase', fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--admin-text)' }}>
                Historial de Pedidos
              </h2>
              <button 
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                style={{
                  padding: '8px 16px',
                  background: showArchived ? 'var(--admin-text)' : 'var(--admin-card-bg)',
                  color: showArchived ? 'var(--admin-bg)' : 'var(--admin-text)',
                  border: '1px solid var(--admin-card-border)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {showArchived ? "Ocultar Archivados" : "Ver Archivados"}
              </button>
            </div>
            
            {orders.filter(o => showArchived ? o.status === 'ARCHIVED' : o.status !== 'ARCHIVED').length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--admin-card-bg)', borderRadius: '12px', border: '1px solid var(--admin-card-border)', color: 'var(--admin-text-muted)' }}>
                No hay pedidos {showArchived ? "archivados" : "activos"}.
              </div>
            ) : (
              <div className={styles.ordersGrid}>
                {orders.filter(o => showArchived ? o.status === 'ARCHIVED' : o.status !== 'ARCHIVED').map(order => (
                  <div key={order.id} className={styles.orderCard} style={{ opacity: order.status === 'ARCHIVED' ? 0.6 : 1 }}>
                    <div className={styles.orderHeader}>
                      <span className={styles.orderId}>Orden #{order.id}</span>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={styles.orderStatusSelect}
                        style={{
                          background: order.status === 'PENDING' ? '#fef3c7' : order.status === 'ACCEPTED' ? '#e0f2fe' : order.status === 'SHIPPING' ? '#e0e7ff' : order.status === 'DELIVERED' ? '#dcfce3' : order.status === 'ARCHIVED' ? 'var(--admin-header-bg)' : '#fee2e2',
                          color: order.status === 'PENDING' ? '#b45309' : order.status === 'ACCEPTED' ? '#0369a1' : order.status === 'SHIPPING' ? '#4338ca' : order.status === 'DELIVERED' ? '#15803d' : order.status === 'ARCHIVED' ? 'var(--admin-text-muted)' : '#b91c1c',
                        }}
                      >
                        <option value="PENDING">Pendiente</option>
                        <option value="ACCEPTED">Aceptado</option>
                        <option value="SHIPPING">Envío en proceso</option>
                        <option value="DELIVERED">Recibido por el cliente</option>
                        <option value="REJECTED">Rechazado</option>
                        <option value="ARCHIVED">Archivado</option>
                      </select>
                    </div>
                  
                    <div className={styles.orderSection}>
                      <div className={styles.sectionTitle}>Cliente</div>
                      <div className={styles.clientInfo}>
                        {order.firstName} {order.lastName} <br/>
                        <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', fontWeight: 400 }}>
                          {order.documentType}-{order.documentNumber}
                        </span>
                      </div>
                    </div>

                    <div className={styles.orderSection}>
                      <div className={styles.sectionTitle}>Entrega</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--admin-text)' }}>
                        <strong>{order.shippingMethod}</strong>
                        {order.shippingZone && ` - Zona: ${order.shippingZone}`}
                        {order.shippingAgency && ` - Agencia: ${order.shippingAgency}`}
                      </div>
                    </div>

                    <div className={styles.orderSection}>
                      <div className={styles.sectionTitle}>Pago</div>
                      <div className={styles.paymentInfo}>
                        <div><strong>Monto:</strong> {order.totalUsd} € / {order.totalBs} Bs</div>
                        <div><strong>Método:</strong> {order.paymentMethod}</div>
                        {order.paymentMethod === 'PAGO_MOVIL' && (
                          <>
                            <div><strong>Banco:</strong> {order.paymentBank}</div>
                            <div><strong>Teléfono:</strong> {order.paymentPhone}</div>
                          </>
                        )}
                        <div><strong>Ref:</strong> {order.paymentReference}</div>
                        {order.paymentScreenshot && (
                          <a href={order.paymentScreenshot} target="_blank" rel="noreferrer" className={styles.screenshotLink}>
                            <ExternalLink size={15} /> Ver Comprobante
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {productToDelete !== null && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modalCard}>
              <Trash2 size={44} color="#ef4444" style={{ margin: '0 auto 16px' }} />
              <h3 className={styles.modalTitle}>¿Eliminar Producto?</h3>
              <p className={styles.modalText}>
                Esta acción no se puede deshacer. El producto será borrado permanentemente de la base de datos.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className={styles.modalCancelBtn}
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={confirmDeleteProduct}
                  style={{
                    padding: '10px 20px',
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modalCard}>
              <LogOut size={44} style={{ margin: '0 auto 16px', color: 'var(--admin-text)' }} />
              <h3 className={styles.modalTitle}>¿Cerrar Sesión?</h3>
              <p className={styles.modalText}>
                Tendrás que volver a ingresar tus credenciales para administrar la tienda.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className={styles.modalCancelBtn}
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={handleLogout}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--admin-text)',
                    color: 'var(--admin-bg)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Sí, Salir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
