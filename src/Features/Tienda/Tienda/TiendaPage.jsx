import { useState } from 'react';
import Filtros from './Filtros';
import GrillaProductos from './GrillaProductos';
import Hero from './Hero';
import DetalleProductoModal from './DetalleProdModal';

export default function TiendaPage({ 
  productos, 
  carrito, 
  agregarAlCarrito, 
  busqueda, 
  setBusqueda, 
  tipoVenta,
  setMostrarCarrito
}) {
  
  // Estado para capturar qué zapatilla se clickeó y abrir el modal de detalle
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // 1. Estados de filtrado internos
  const [filtroMarca, setFiltroMarca] = useState('Todos');
  const [filtroTalle, setFiltroTalle] = useState('Todos');
  const [filtroSexo, setFiltroSexo] = useState('Todos');

  // 2. Generar de forma dinámica la lista de talles disponibles basados en el stock real
  const listaTallesDisponibles = [...new Set(productos.flatMap(p => p.talles || []))].sort((a, b) => a - b);

  // 3. Lógica de filtrado en tiempo real (Corregida con String() para evitar bugs de tipos)
  const productosFiltrados = productos.filter(prod => {
    const coincideBusqueda = prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            prod.marca.toLowerCase().includes(busqueda.toLowerCase());
    const coincideMarca = filtroMarca === 'Todos' || prod.marca === filtroMarca;
    const coincideTalle = filtroTalle === 'Todos' || prod.talles?.some(t => String(t) === String(filtroTalle));
    const coincideSexo = filtroSexo === 'Todos' || prod.sexo === filtroSexo;
    
    return coincideBusqueda && coincideMarca && coincideTalle && coincideSexo;
  });

  return (
    <>
      {/* SECCIÓN HERO DE BIENVENIDA */}
      <Hero />  

      {/* SECCIÓN DE INFORMACIÓN INSTITUCIONAL */}
      <section className="bg-white border-t border-b border-slate-200/60 py-12 px-4 mt-16 shadow-2xs">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-sm font-black tracking-widest text-[#FF6696] uppercase mb-2">Información Importante</h2>
            <p className="text-slate-500 font-bold text-xs">Todo lo que necesitás saber antes de coordinar tu pedido con nosotros.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FFE8EE]/30 border border-[#FFE8EE] p-5 rounded-2xl flex gap-4">
              <span className="text-2xl">📍</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Envíos Locales y Nacionales</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                  Hacemos entregas directas y envíos a todo el país. Coordinamos el método que te sea más cómodo al momento de confirmar el pedido por WhatsApp.
                </p>
              </div>
            </div>

            {/* Adaptado a Venta Minorista Exclusiva */}
            <div className="bg-[#FFE8EE]/30 border border-[#FFE8EE] p-5 rounded-2xl flex gap-4">
              <span className="text-2xl">🛍️</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Compra Minorista Directa</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                  No exigimos mínimos de compra. Llevate el par que más te guste eligiendo libremente entre los talles y colores que registramos con stock en tiempo real.
                </p>
              </div>
            </div>

            <div className="bg-[#FFE8EE]/30 border border-[#FFE8EE] p-5 rounded-2xl flex gap-4">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Atención Inmediata</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                  Una vez enviado tu carrito, nos pondremos en contacto para validar la curva de talles, disponibilidad de colores y acordar el método de pago.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BARRA DE FILTROS AVANZADOS INTEGRADA */}
      <Filtros 
        filtroMarca={filtroMarca}
        setFiltroMarca={setFiltroMarca}
        filtroTalle={filtroTalle}
        setFiltroTalle={setFiltroTalle}
        filtroSexo={filtroSexo}
        setFiltroSexo={setFiltroSexo}
        listaTallesDisponibles={listaTallesDisponibles}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
      />

      {/* GRILLA DE PRODUCTOS INTEGRADA (Agregamos la prop onVerDetalle) */}
      <GrillaProductos 
        productosFiltrados={productosFiltrados}
        tipoVenta={tipoVenta}
        agregarAlCarrito={agregarAlCarrito}
        onVerDetalle={(prod) => setProductoSeleccionado(prod)} // 👈 Enviamos la función selectora hacia abajo
      />

      {/* RENDERIZADO CONDICIONAL DEL MODAL DE DETALLE PREMIUM */}
        <DetalleProductoModal 
          isOpen={!!productoSeleccionado} // 👈 Le avisamos al modal que tiene que mostrarse
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)} // 👈 Conectamos el botón de cerrar
          onAgregarAlPedido={agregarAlCarrito} // 👈 Conectamos la acción del carrito
          onVerCarrito={() => setMostrarCarrito(true)}
        />
    </>
  );
}