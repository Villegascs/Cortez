"use client";

import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import styles from "./page.module.css";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${unwrappedParams.id}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setOrder(data.order);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar />
        <div>Cargando información de tu pedido...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <Navbar />
        <h2>Orden no encontrada</h2>
        <p>No pudimos encontrar la orden #{unwrappedParams.id}. Verifica el enlace.</p>
        <Link href="/" style={{ padding: '10px 20px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: '6px' }}>Volver a la tienda</Link>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'PENDING': return { text: 'Pendiente de Aprobación', color: '#d97706', bg: '#fef3c7', icon: <Clock size={40} color="#d97706" /> };
      case 'ACCEPTED': return { text: 'Aceptado y Empacando', color: '#0369a1', bg: '#e0f2fe', icon: <Package size={40} color="#0369a1" /> };
      case 'SHIPPING': return { text: 'Envío en Proceso', color: '#4338ca', bg: '#e0e7ff', icon: <Truck size={40} color="#4338ca" /> };
      case 'DELIVERED': return { text: 'Recibido por el cliente', color: '#15803d', bg: '#dcfce3', icon: <CheckCircle size={40} color="#15803d" /> };
      case 'REJECTED': return { text: 'Rechazado/Cancelado', color: '#b91c1c', bg: '#fee2e2', icon: <Clock size={40} color="#b91c1c" /> };
      default: return { text: 'Desconocido', color: '#64748b', bg: '#f1f5f9', icon: <Clock size={40} color="#64748b" /> };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Navbar />
      
      <div style={{ paddingTop: '120px', paddingBottom: '60px', maxWidth: '600px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '30px', textAlign: 'center' }}>
          Rastreo de Orden #{order.id}
        </h1>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '40px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ background: statusInfo.bg, padding: '20px', borderRadius: '50%' }}>
              {statusInfo.icon}
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: statusInfo.color, marginBottom: '10px' }}>
            {statusInfo.text}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Hola {order.firstName}, aquí podrás ver las actualizaciones en tiempo real de tu pedido.
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Resumen del Pedido</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span style={{ color: '#64748b' }}>Método de entrega</span>
            <span style={{ fontWeight: 500 }}>{order.shippingMethod}</span>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            {order.items.map((item: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>{item.quantity}x {item.product.name}</span>
                <span style={{ fontWeight: 500 }}>${item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', fontSize: '1.2rem', fontWeight: 700 }}>
            <span>Total Pagado</span>
            <span>${order.totalUsd}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
