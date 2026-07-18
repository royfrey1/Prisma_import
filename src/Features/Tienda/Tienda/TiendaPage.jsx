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
  const [ordenPrecio, setOrdenPrecio] = useState('Destacados');

  // 2. Generar de forma dinámica la lista de talles disponibles basados en el stock real
  const listaTallesDisponibles = [...new Set(productos.flatMap(p => p.talles || []))].sort((a, b) => a - b);

  // 3. Lógica de filtrado en tiempo real y ORDENAMIENTO combinados
  const productosFiltradosYOrdenados = productos
    .filter(prod => {
      const coincideBusqueda = prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                              prod.marca.toLowerCase().includes(busqueda.toLowerCase());
      const coincideMarca = filtroMarca === 'Todos' || prod.marca === filtroMarca;
      const coincideTalle = filtroTalle === 'Todos' || prod.talles?.some(t => String(t) === String(filtroTalle));
      const coincideSexo = filtroSexo === 'Todos' || prod.sexo === filtroSexo;
      
      return coincideBusqueda && coincideMarca && coincideTalle && coincideSexo;
    })
    // 🌟 LOGICA DE ORDENAMIENTO CORREGIDA (Cambiamos 'precio' por 'precio_menor')
    .sort((a, b) => {
      if (ordenPrecio === 'MenorMayor') {
        return Number(a.precio_menor) - Number(b.precio_menor);
      }
      if (ordenPrecio === 'MayorMenor') {
        return Number(b.precio_menor) - Number(a.precio_menor);
      }
      return 0; // Si es 'Destacados', los deja en el orden original
    });


  return (
    <>
      {/* SECCIÓN HERO DE BIENVENIDA */}
      <Hero />  

        {/* SECCIÓN DE INFORMACIÓN INSTITUCIONAL */}
        <section className="bg-white border-t border-b border-slate-200/60 py-12 px-4 mt-16 shadow-2xs">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-sm font-chewy tracking-widest text-[#FF6696] uppercase mb-2">Información Importante</h2>
              <p className="text-slate-500 font-bold text-xs">Todo lo que necesitás saber antes de coordinar tu pedido con nosotros.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 1. Envíos Nacionales Corregidos */}
              <div className="bg-[#FFE8EE]/30 border border-[#FFE8EE] p-5 rounded-2xl flex gap-4">
                <span className="text-2xl">📦</span>
                <div>
                  <h3 className="font-chewy text-slate-900 text-sm mb-1">Envíos a Todo el País</h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                    Realizamos envíos nacionales a cualquier punto de la Argentina. Coordinamos la empresa de transporte que te sea más cómoda al momento de confirmar el pedido por WhatsApp.
                  </p>
                </div>
              </div>

              {/* 2. Venta por unidad (Mensaje de compra mínima conservado) */}
              <div className="bg-[#FFE8EE]/30 border border-[#FFE8EE] p-5 rounded-2xl flex gap-4">
                <span className="text-2xl">🛍️</span>
                <div>
                  <h3 className="font-chewy text-slate-900 text-sm mb-1">Compra Minorista Directa</h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                    No exigimos mínimos de compra. Llevate el par que más te guste eligiendo libremente entre los talles y colores que registramos con stock en tiempo real.
                  </p>
                </div>
              </div>

              {/* 3. Atención Inmediata (Curva de talles eliminada) */}
              <div className="bg-[#FFE8EE]/30 border border-[#FFE8EE] p-5 rounded-2xl flex gap-4">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-chewy text-slate-900 text-sm mb-1">Atención Inmediata</h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                    Una vez enviado tu carrito, nos pondremos en contacto para confirmar la disponibilidad de tu par seleccionado, acordar el método de pago y agilizar tu despacho.
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
          ordenPrecio={ordenPrecio}      
          setOrdenPrecio={setOrdenPrecio}
        />

        {/* GRILLA DE PRODUCTOS INTEGRADA */}
        <GrillaProductos 
          productosFiltrados={productosFiltradosYOrdenados} // 👈 Pasamos el array filtrado Y ordenado
          tipoVenta={tipoVenta}
          agregarAlCarrito={agregarAlCarrito}
          onVerDetalle={(prod) => setProductoSeleccionado(prod)} 
        />

        {/* RENDERIZADO CONDICIONAL DEL MODAL DE DETALLE PREMIUM */}
        <DetalleProductoModal 
          isOpen={!!productoSeleccionado} 
          producto={productoSeleccionado}
          onClose={() => setProductoSeleccionado(null)} 
          onAgregarAlPedido={agregarAlCarrito} 
          onVerCarrito={() => setMostrarCarrito(true)}
        />
      </>
    );
}