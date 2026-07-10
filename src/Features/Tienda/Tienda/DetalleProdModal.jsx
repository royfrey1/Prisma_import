import React, { useState, useEffect } from 'react';

export default function DetalleProductoModal({ producto, isOpen, onClose, onAgregarAlPedido, onVerCarrito }) {
  // 🌟 EFECTO MEMORIA: Retiene el producto mientras se ejecuta la animación de cierre
  const [prodActivo, setProdActivo] = useState(null);

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

  // Si no hay producto activo en memoria, no renderizamos nada estructural todavía
  const prod = producto || prodActivo;

  // 🛡️ MANEJO DINÁMICO BLINDADO: Filtra textos vacíos para evitar imágenes rotas ("")
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

    // El filtro clave: elimina cualquier espacio extra, nulos o textos vacíos ""
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

  // Sincronizar foto principal cuando cambia el producto activo o la lista de fotos calculada
  useEffect(() => {
    if (fotosArray.length > 0) {
      setFotoActiva(fotosArray[0]);
    } else {
      setFotoActiva('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'); // Fallback por si no tiene fotos
    }
  }, [prodActivo, producto, prod?.imagenes_urls, prod?.imagen_url]);

  if (!prod) return null;

  // Procesar colores de forma segura
  const listaColores = (() => {
    if (!prod.colores) return [];
    if (Array.isArray(prod.colores)) return prod.colores.map(c => String(c).trim());
    if (typeof prod.colores === 'string') return prod.colores.split(',').map(c => c.trim());
    return [String(prod.colores)];
  })();

  const handleAgregar = () => {
    if (prod.talles?.length > 0 && !talleSeleccionado) {
      alert("Por favor, seleccioná un talle antes de agregar.");
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

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen 
          ? 'opacity-100 pointer-events-auto backdrop-blur-xs' 
          : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Fondo oscuro clickeable con desvanecimiento */}
      <div 
        className="absolute inset-0 bg-slate-950/50 transition-opacity duration-300" 
        onClick={handleSeguirComprando}
      ></div>
      
      {/* CONTENEDOR DEL MODAL: Animación desde el centro (Pop-In) */}
      <div 
        className={`relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-[#FF6696]/20 grid grid-cols-1 md:grid-cols-12 max-h-[90vh] md:max-h-[85vh] transition-all duration-300 ease-out transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-80 opacity-0'
        }`}
      >
        
        {/* BOTÓN CERRAR */}
        <button 
          onClick={handleSeguirComprando}
          className="absolute top-4 right-4 z-10 bg-slate-900 hover:bg-rose-600 text-white p-2.5 rounded-full transition-colors cursor-pointer shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L12 12M12 12l6 6M12 12l6-6M12 12L6 6" />
          </svg>
        </button>

        {/* COLUMNA IZQUIERDA: GALERÍA DE IMÁGENES */}
        <div className="md:col-span-6 bg-slate-50 p-6 flex flex-col justify-between items-center border-r border-slate-100">
          <div className="w-full h-64 md:h-80 bg-white rounded-2xl overflow-hidden shadow-xs flex items-center justify-center relative">
    
            {/* 🌟 DETECCIÓN DINÁMICA: ¿Es un video o una imagen? */}
            {fotoActiva && (fotoActiva.endsWith('.mp4') || fotoActiva.endsWith('.mov') || fotoActiva.endsWith('.webm') || fotoActiva.includes('video')) ? (
              <video 
                src={fotoActiva} 
                controls 
                muted
                autoPlay
                loop
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <img src={fotoActiva} alt={prod.nombre} className="w-full h-full object-contain p-2" />
            )}

            <span className="absolute top-3 left-3 bg-slate-950 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
              {prod.marca}
            </span>
          </div>

          {/* 📸 MINIATURAS VISIBLES SOLO SI HAY MÁS DE UNA FOTO/VIDEO REAL VALIDO */}
          {fotosArray.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto w-full py-1 justify-center">
              {fotosArray.map((img, index) => {
                // Detectamos si esta miniatura específica es un video
                const esMinVideo = img && (
                  img.toLowerCase().includes('.mp4') || 
                  img.toLowerCase().includes('.mov') || 
                  img.toLowerCase().includes('.webm') || 
                  img.toLowerCase().includes('video')
                );

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFotoActiva(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 bg-white p-0.5 transition-all cursor-pointer flex-shrink-0 relative flex items-center justify-center ${
                      fotoActiva === img ? 'border-[#FF0A57] scale-105 shadow-xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {esMinVideo ? (
                      <>
                        {/* Usamos una miniatura compacta de video para previsualizarlo */}
                        <video src={img} className="w-full h-full object-cover rounded-lg" preload="metadata" muted />
                        
                        {/* Icono de Play superpuesto de forma elegante */}
                        <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-950/10">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white filter drop-shadow-md" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      /* Si es una imagen común, renderiza el img de siempre */
                      <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: INTERFACES CONMUTABLES */}
        <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between overflow-y-auto min-h-[350px]">
          
          {!agregadoExito ? (
            <>
              <div>
                <span className="text-[10px] font-black text-[#FF0A57] uppercase tracking-widest block mb-1">
                  Calzado {prod.sexo || 'Unisex'}
                </span>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight capitalize mb-2">
                  {prod.nombre}
                </h2>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-black text-[#FF0A57]">
                    ${prod.precio_menor?.toLocaleString('es-AR')}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Precio Final Minorista</span>
                </div>

                <hr className="border-slate-100 mb-5" />

                {listaColores.length > 0 && (
                  <div className="mb-5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Seleccionar Color:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {listaColores.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setColorSeleccionado(color)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            colorSeleccionado === color || (!colorSeleccionado && listaColores[0] === color)
                              ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Talles Disponibles:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {prod.talles?.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTalleSeleccionado(t)}
                        className={`w-10 h-10 text-xs font-black rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                          talleSeleccionado === t
                            ? 'bg-[#FF0A57] text-white border-[#FF0A57] shadow-md scale-105'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Cantidad:
                  </label>
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl w-fit p-1">
                    <button type="button" onClick={() => setCantidad(prev => Math.max(1, prev - 1))} className="w-8 h-8 font-black text-slate-600 hover:bg-white rounded-lg cursor-pointer">-</button>
                    <span className="text-xs font-black px-2 text-slate-900 w-6 text-center">{cantidad}</span>
                    <button type="button" onClick={() => setCantidad(prev => prev + 1)} className="w-8 h-8 font-black text-slate-600 hover:bg-white rounded-lg cursor-pointer">+</button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleAgregar}
                  className="w-full bg-[#FF0A57] hover:bg-[#FF0A57]/90 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs transition-all cursor-pointer shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  🛍️ Agregar Al Pedido ({cantidad})
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center text-center h-full my-auto py-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-xs border border-emerald-200 animate-bounce">
                ✓
              </div>
              
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                ¡Agregado al carrito!
              </h3>
              
              <p className="text-xs font-medium text-slate-500 max-w-xs mb-8 leading-relaxed">
                Sumaste <span className="font-bold text-slate-800">{cantidad}x {prod.nombre}</span> (Talle {talleSeleccionado}) a tu orden actual.
              </p>

              <div className="w-full flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleSeguirComprando();
                    if (onVerCarrito) onVerCarrito();
                  }}
                  className="w-full bg-slate-950 hover:bg-slate-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  🛒 Ver mi carrito / Completar Pedido
                </button>

                <button
                  type="button"
                  onClick={handleSeguirComprando}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-4 rounded-2xl uppercase tracking-widest text-xs transition-all cursor-pointer border border-slate-200"
                >
                  👀 Seguir mirando productos
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}