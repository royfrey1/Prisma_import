import React, { useState, useEffect } from 'react';

export default function CarritoModal({
  mostrarCarrito,
  setMostrarCarrito,
  carrito,
  setCarrito,
  isOpen
}) {

  useEffect(() => {
      if (mostrarCarrito) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      // Función de limpieza por seguridad si se desmonta el componente
      return () => {
        document.body.style.overflow = '';
      };
  }, [mostrarCarrito]);

  // Calculamos el total de forma interna y automática basado en el estado del carrito
  const totalCarrito = carrito.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);

  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${
        mostrarCarrito 
          ? 'opacity-100 pointer-events-auto backdrop-blur-xs' 
          : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Fondo oscuro clickeable con Fade-In sutil */}
      <div 
        className="absolute inset-0 bg-slate-950/40 transition-opacity duration-300" 
        onClick={() => setMostrarCarrito(false)}
      ></div>
      
      {/* PANEL DERECHO: Deslizamiento suave (Slide-In) */}
      <div 
        className={`bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl relative transition-transform duration-300 ease-out transform ${
          mostrarCarrito ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        
        {/* HEADER DEL CARRITO */}
        <div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-slate-900 text-lg tracking-tight">🛒 Tu Pedido</h3>
            </div>
            <button 
              onClick={() => setMostrarCarrito(false)} 
              className="text-slate-400 hover:text-slate-600 text-sm font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>

          {/* LISTA DE PRODUCTOS AGREGADOS */}
          <div className="mt-6 space-y-4 overflow-y-auto max-h-[60vh] pr-1">
            {carrito.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="text-3xl block mb-2">🛍️</span>
                <p className="text-xs font-bold">El carrito está vacío.</p>
                <p className="text-[11px] mt-1">¡Agregá algunos modelos de la tienda!</p>
              </div>
            ) : (
              carrito.map((item) => (
                <div key={item.id} className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 relative group">
                  {/* Miniatura de la zapatilla */}
                  <img src={item.imagen_url} alt={item.nombre} className="w-16 h-16 rounded-xl object-cover bg-slate-200" />
                  
                  {/* Detalles y Controles de edición */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight line-clamp-1">{item.nombre}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">{item.marca}</p>
                    </div>

                    {/* 🛠️ AGREGAR ESTO: Talle y Color Elegidos */}
                    <div className="flex items-center gap-2 mt-1">
                      {item.talleElegido && (
                        <span className="text-[11px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                          Talle: {item.talleElegido}
                        </span>
                      )}
                      {item.colorElegido && (
                        <span className="text-[11px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          Color: {item.colorElegido}
                        </span>
                      )}
                    </div>
                    
                      {/* Controles para Editar Cantidades */}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                          <button 
                            onClick={() => {
                              if (item.cantidad === 1) {
                                // 🛠️ FILTRADO COMPLETO: Borra solo el talle y color exactos
                                setCarrito(carrito.filter(i => 
                                  !(i.id === item.id && i.talleElegido === item.talleElegido && i.colorElegido === item.colorElegido)
                                ));
                              } else {
                                // 🛠️ TRIPLE CHEQUEO: Resta solo a la variante exacta
                                setCarrito(carrito.map(i => 
                                  i.id === item.id && i.talleElegido === item.talleElegido && i.colorElegido === item.colorElegido
                                    ? { ...i, cantidad: i.cantidad - 1 } 
                                    : i
                                ));
                              }
                            }}
                            className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
                          >
                            -
                          </button>
                          
                          <span className="text-xs font-black text-slate-800 min-w-[12px] text-center">{item.cantidad}</span>
                          
                          {/* Botón más controlado y deshabilitado estéticamente */}
                          <button 
                            disabled={
                              item.cantidad >= (item.stock_variantes?.find(
                                v => String(v.talle).trim() === String(item.talleElegido).trim()
                              )?.cantidad || 5)
                            }
                            onClick={() => {
                              // 1. Buscamos el stock real disponible para este talle específico
                              const varianteStock = item.stock_variantes?.find(
                                v => String(v.talle).trim() === String(item.talleElegido).trim()
                              );
                              
                              const maxStockDisponible = varianteStock ? (varianteStock.cantidad || 0) : 5;

                              // 2. Doble seguro por si llegan a clickear antes de que cambie el estado
                              if (item.cantidad >= maxStockDisponible) {
                                Swal.fire({
                                  title: '<span style="font-family: sans-serif; font-weight: 900;">¡Límite de stock!</span>',
                                  html: `<p style="font-size: 14px; color: #64748b; font-weight: 500;">Disculpá, solo quedan <strong>${maxStockDisponible}</strong> unidades disponibles.</p>`,
                                  icon: 'info',
                                  confirmButtonText: 'Entendido',
                                  confirmButtonColor: '#FF0A57',
                                  customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-xl font-bold px-5 py-2.5 text-xs' }
                                });
                                return;
                              }

                              // 3. Sumamos normalmente
                              setCarrito(carrito.map(i => 
                                i.id === item.id && i.talleElegido === item.talleElegido && i.colorElegido === item.colorElegido
                                  ? { ...i, cantidad: i.cantidad + 1 } 
                                  : i
                              ));
                            }}
                            className={`w-5 h-5 flex items-center justify-center text-xs font-bold rounded-md transition-colors ${
                              item.cantidad >= (item.stock_variantes?.find(v => String(v.talle).trim() === String(item.talleElegido).trim())?.cantidad || 5)
                                ? 'text-slate-300 bg-slate-50 cursor-not-allowed' // Si llegó al límite: grisado y sin mano
                                : 'text-slate-500 hover:bg-slate-100 cursor-pointer' // Si hay stock: normal con hover
                            }`}
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Precio acumulado por producto */}
                        <span className="text-xs font-black text-slate-900">
                          ${(item.precioUnitario * item.cantidad).toLocaleString('es-AR')}
                        </span>
                      </div>
                  </div>

                  {/* Botón rápido para eliminar ítem completo */}
                  <button 
                    // 🛠️ FILTRADO COMPLETO: Elimina únicamente la variante seleccionada
                    onClick={() => setCarrito(carrito.filter(i => 
                      !(i.id === item.id && i.talleElegido === item.talleElegido && i.colorElegido === item.colorElegido)
                    ))}
                    className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 text-[11px] transition-colors cursor-pointer"
                    title="Eliminar artículo"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FOOTER DEL CARRITO: TOTALIZADOR Y ENVIAR A WHATSAPP */}
        <div className="border-t border-slate-100 pt-4 bg-white">
          <div className="flex justify-between items-center mb-4 px-1">
            <div>
              <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-wider">Subtotal Neto</span>
              <span className="text-xs text-slate-500 font-medium">({carrito.reduce((acc, i) => acc + i.cantidad, 0)} artículos)</span>
            </div>
            <span className="text-xl font-black text-slate-900">
              ${totalCarrito.toLocaleString('es-AR')}
            </span>
          </div>

          {/* Botón de Envío */}
          <button 
            disabled={carrito.length === 0}
            onClick={() => {
              const numeroMelani = "5493757334637"; 
              let mensaje = `👋 ¡Hola Yona! Quiero realizar un pedido en *PRISMA_IMPORT*:\n\n`;
              
              carrito.forEach((item, index) => {
                mensaje += `🔹 *${index + 1}. ${item.nombre}*\n`;
                mensaje += `   • Marca: ${item.marca}\n`;
                if(item.talleElegido)  mensaje += `   • Talle: ${item.talleElegido}\n`;
                if(item.colorElegido)  mensaje += `   • Color: ${item.colorElegido}\n`;
                mensaje += `   • Cantidad: ${item.cantidad} u.\n`;
                mensaje += `   • Subtotal: $${(item.precioUnitario * item.cantidad).toLocaleString('es-AR')}\n\n`;
              });
              
              mensaje += `⚙️ *TOTAL ESTIMADO:* $${totalCarrito.toLocaleString('es-AR')}\n`;
              mensaje += `\n¿Me confirmarías si tenés stock disponible de estos modelos? 🙌`;

              const mensajeEncriptado = encodeURIComponent(mensaje);
              window.open(`https://wa.me/${numeroMelani}?text=${mensajeEncriptado}`, '_blank');
            }}
            className={`w-full font-bold py-4 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              carrito.length === 0 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-[#FF0A57]/80 text-white hover:bg-[#FF0A57] cursor-pointer'
            }`}
          >
            💬 Enviar Pedido
          </button>
        </div>

      </div>
    </div>
  );
}