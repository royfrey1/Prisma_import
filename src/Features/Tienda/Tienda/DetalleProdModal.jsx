import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function DetalleProductoModal({ producto, isOpen, onClose, onAgregarAlPedido, onVerCarrito }) {
  // 🌟 EFECTO MEMORIA: Retiene el producto mientras se ejecuta la animación de cierre
  const [prodActivo, setProdActivo] = useState(null);
  
  // 🔍 NUEVO ESTADO: Controla el visor de pantalla completa (Lightbox)
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Limpieza por si el componente se desmonta inesperadamente
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (producto) {
      setProdActivo(producto);
      // Resetear estados internos al cambiar de producto
      setAgregadoExito(false);
      setTalleSeleccionado(null);
      setColorSeleccionado(null);
      setCantidad(1);
    }
  }, [producto]);

  const prod = producto || prodActivo;

  // 🛡️ MANEJO DINÁMICO BLINDADO
  const fotosArray = (() => {
    if (!prod) return [];
    let baseArray = [];
    if (Array.isArray(prod.imagenes_urls)) {
      baseArray = prod.imagenes_urls;
    } else if (prod.imagenes_urls && typeof prod.imagenes_urls === 'string') {
      baseArray = prod.imagenes_urls.split(',');
    } else if (prod.imagen_url) {
      baseArray = [prod.imagen_url];
    }
    return baseArray
      .map(img => (typeof img === 'string' ? img.trim() : ''))
      .filter(img => img !== '');
  })();

  // Estados locales de selección
  const [fotoActiva, setFotoActiva] = useState('');
  const [talleSeleccionado, setTalleSeleccionado] = useState(null);
  const [colorSeleccionado, setColorSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregadoExito, setAgregadoExito] = useState(false);

  useEffect(() => {
    if (fotosArray.length > 0) {
      setFotoActiva(fotosArray[0]);
    } else {
      setFotoActiva('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500');
    }
  }, [prodActivo, producto, prod?.imagenes_urls, prod?.imagen_url]);

  if (!prod) return null;

  const listaColores = (() => {
    if (!prod.colores) return [];
    if (Array.isArray(prod.colores)) return prod.colores.map(c => String(c).trim());
    if (typeof prod.colores === 'string') return prod.colores.split(',').map(c => c.trim());
    return [String(prod.colores)];
  })();

  const handleAgregar = () => {
      if (prod.talles?.length > 0 && !talleSeleccionado) {
        // Alerta estética de advertencia personalizada
        Swal.fire({
          title: '<span style="font-family: sans-serif; font-weight: 900;">¡Falta el talle!</span>',
          html: '<p style="font-size: 14px; color: #64748b; font-weight: 500;">Por favor, seleccioná un talle disponible antes de añadir el calzado al pedido.</p>',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#FF0A57', // Color rosa de tu identidad
          buttonsStyling: true,
          customClass: {
            popup: 'rounded-3xl',
            confirmButton: 'rounded-xl font-bold px-5 py-2.5 text-xs uppercase tracking-wider'
          }
        });
        return;
      }

      onAgregarAlPedido({
        ...prod,
        talleElegido: talleSeleccionado,
        colorElegido: colorSeleccionado || listaColores[0],
        cantidadElegida: cantidad,
        imagenElegida: fotoActiva
      });
      
      setAgregadoExito(true);
  };

  const handleSeguirComprando = () => {
    onClose();
  };

  // Helper para identificar si el archivo activo es un video
  const esVideo = (url) => {
    return url && (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm') || url.includes('video'));
  };

  return (
    <>
      {/* 1. MODAL PRINCIPAL COMPACTO Y CON SCROLL */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto backdrop-blur-xs' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-slate-950/60 transition-opacity duration-300" onClick={handleSeguirComprando}></div>
        
        {/* CONTENEDOR CON CONTROL DE DESBORDAMIENTO (max-h y overflow-y-auto global para mobile) */}
        <div 
          className={`relative bg-white w-full max-w-4xl rounded-2xl overflow-y-auto md:overflow-hidden shadow-2xl border border-[#FF6696]/20 grid grid-cols-1 md:grid-cols-12 max-h-[92vh] md:max-h-[85vh] transition-all duration-300 ease-out transform ${
            isOpen ? 'scale-100 opacity-100' : 'scale-80 opacity-0'
          }`}
        >
          
          {/* BOTÓN CERRAR GENERAL */}
          <button 
            onClick={handleSeguirComprando}
            className="absolute top-3 right-3 z-20 bg-slate-900/80 hover:bg-rose-600 text-white p-2 rounded-full transition-colors cursor-pointer shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L12 12M12 12l6 6M12 12l6-6M12 12L6 6" />
            </svg>
          </button>

          {/* COLUMNA IZQUIERDA: GALERÍA DE IMÁGENES (Reducida en cel) */}
          <div className="md:col-span-6 bg-slate-50 p-4 sm:p-5 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-100">
            {/* Contenedor de la foto activa, ahora clickeable para Zoom */}
            <div 
              onClick={() => setIsZoomOpen(true)}
              className="w-full h-52 sm:h-64 md:h-80 bg-white rounded-xl overflow-hidden shadow-2xs flex items-center justify-center relative cursor-zoom-in group"
            >
              {esVideo(fotoActiva) ? (
                <video src={fotoActiva} controls muted autoPlay loop className="w-full h-full object-contain p-1" />
              ) : (
                <img src={fotoActiva} alt={prod.nombre} className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-102" />
              )}

              <span className="absolute top-2 left-2 bg-slate-950 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">
                {prod.marca}
              </span>

              {/* Indicador visual de que se puede agrandar */}
              <div className="absolute bottom-2 right-2 bg-slate-950/60 text-white p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                <span>🔍</span> Click para pantalla completa
              </div>
            </div>

            {/* MINIATURAS */}
            {fotosArray.length > 1 && (
              <div className="flex gap-1.5 mt-3 overflow-x-auto w-full py-1 justify-center scrollbar-none">
                {fotosArray.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFotoActiva(img)}
                    className={`w-11 h-11 rounded-lg overflow-hidden border-2 bg-white p-0.5 transition-all cursor-pointer flex-shrink-0 relative flex items-center justify-center ${
                      fotoActiva === img ? 'border-[#FF0A57] scale-105' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    {esVideo(img) ? (
                      <video src={img} className="w-full h-full object-cover rounded-md" preload="metadata" muted />
                    ) : (
                      <img src={img} alt="" className="w-full h-full object-cover rounded-md" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: INTERFACES CONMUTABLES (Con scroll interno propio en PC) */}
          <div className="md:col-span-6 p-5 sm:p-6 md:overflow-y-auto flex flex-col justify-between md:max-h-[85vh]">
            
            {!agregadoExito ? (
              <>
                <div>
                  <span className="text-[9px] font-black text-[#FF0A57] uppercase tracking-widest block mb-0.5">
                    Calzado {prod.sexo || 'Unisex'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight capitalize mb-1">
                    {prod.nombre}
                  </h2>
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span className="text-2xl sm:text-3xl font-black text-[#FF0A57]">
                      ${prod.precio_menor?.toLocaleString('es-AR')}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">Precio Final Minorista</span>
                  </div>

                  <hr className="border-slate-100 mb-4" />

                  {/* COLORES */}
                  {listaColores.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                        Seleccionar Color:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {listaColores.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setColorSeleccionado(color)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              colorSeleccionado === color || (!colorSeleccionado && listaColores[0] === color)
                                ? 'bg-slate-950 text-white border-slate-950'
                                : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TALLES */}
                  <div className="mb-4">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Talles Disponibles:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {prod.talles?.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTalleSeleccionado(t)}
                          className={`w-9 h-9 text-xs font-black rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                            talleSeleccionado === t
                              ? 'bg-[#FF0A57] text-white border-[#FF0A57] shadow-sm scale-105'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CANTIDAD */}
                  <div className="mb-5">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Cantidad:
                    </label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl w-fit p-1">
                      <button type="button" onClick={() => setCantidad(prev => Math.max(1, prev - 1))} className="w-7 h-7 font-black text-slate-600 hover:bg-white rounded-lg cursor-pointer">-</button>
                      <span className="text-xs font-black px-1.5 text-slate-900 w-5 text-center">{cantidad}</span>
                      <button type="button" onClick={() => setCantidad(prev => prev + 1)} className="w-7 h-7 font-black text-slate-600 hover:bg-white rounded-lg cursor-pointer">+</button>
                    </div>
                  </div>
                </div>

                {/* BOTÓN DE ACCIÓN */}
                <div className="pt-3 border-t border-slate-100 mt-auto">
                  <button
                    type="button"
                    onClick={handleAgregar}
                    className="w-full bg-[#FF0A57] hover:bg-[#FF0A57]/90 text-white font-black py-3 rounded-xl uppercase tracking-widest text-[11px] transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                  >
                    🛍️ Agregar Al Pedido ({cantidad})
                  </button>
                </div>
              </>
            ) : (
              /* PANTALLA ÉXITO */
              <div className="flex flex-col justify-center items-center text-center py-6 my-auto">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mb-3 shadow-2xs border border-emerald-200 animate-bounce">
                  ✓
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
                  ¡Agregado al carrito!
                </h3>
                <p className="text-[11px] font-medium text-slate-500 max-w-xs mb-6">
                  Sumaste <span className="font-bold text-slate-800">{cantidad}x {prod.nombre}</span> (Talle {talleSeleccionado}) a tu orden.
                </p>

                <div className="w-full flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => { handleSeguirComprando(); if (onVerCarrito) onVerCarrito(); }}
                    className="w-full bg-slate-950 text-white font-black py-3.5 rounded-xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    🛒 Ver mi carrito / Completar Pedido
                  </button>
                  <button
                    type="button"
                    onClick={handleSeguirComprando}
                    className="w-full bg-slate-100 text-slate-700 font-black py-3.5 rounded-xl uppercase tracking-widest text-[10px] border border-slate-200 cursor-pointer"
                  >
                    👀 Seguir mirando
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 2. MODAL LIGHTBOX NUEVO: SE ENCIENDE SOLO AL HACER CLICK EN LA FOTO PRINCIPAL */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-2 sm:p-4 animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Botón de cierre superior del zoom */}
          <button 
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors cursor-pointer"
            onClick={() => setIsZoomOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L12 12M12 12l6 6M12 12l6-6M12 12L6 6" />
            </svg>
          </button>

          {/* Renderizado dinámico full-screen */}
          <div className="max-w-full max-h-full flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
            {esVideo(fotoActiva) ? (
              <video src={fotoActiva} controls autoPlay className="max-w-full max-h-[92vh] object-contain rounded-lg" />
            ) : (
              <img src={fotoActiva} alt={prod.nombre} className="max-w-full max-h-[92vh] object-contain rounded-lg select-none" />
            )}
          </div>
        </div>
      )}
    </>
  );
}