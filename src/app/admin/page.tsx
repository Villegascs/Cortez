"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";

export default function AdminPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [usdtRate, setUsdtRate] = useState<number>(40.5);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.rate) setUsdtRate(data.rate);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSettings();
    setLoading(false);
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
      fetchOrders(); // refresh
    } catch (error) {
      alert("Error actualizando pedido");
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
              type="number" 
              step="0.01" 
              className="input-field" 
              value={usdtRate} 
              onChange={(e) => setUsdtRate(Number(e.target.value))} 
              style={{ width: '120px' }}
            />
          </div>
          <button className="btn-primary" onClick={handleUpdateRate} style={{ marginTop: '20px' }}>
            <Save size={20} />
          </button>
        </div>
      </div>

      <h2 style={{ marginBottom: '20px' }}>Pedidos Recientes</h2>
      
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
                  <span style={{color: 'var(--text-secondary)'}}>{order.documentType}-{order.documentNumber}</span>
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
                  <button className={styles.rejectBtn} onClick={() => handleUpdateOrderStatus(order.id, 'RECHAZADO')}>
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
