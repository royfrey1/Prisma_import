import React from 'react';
import TarjetaProducto from './TarjetaProducto';

export default function GrillaProductos({ productosFiltrados, agregarAlCarrito, onVerDetalle }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-3 sm:px-4 py-8 max-w-7xl mx-auto">
      {productosFiltrados.map((prod) => (
        <div 
          key={prod.id}
          className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between p-2.5 sm:p-3 group hover:shadow-md transition-all duration-300"
        >
          {/* TOP: Imagen y Badges */}
          <div className="h-36 sm:h-44 md:h-48 bg-slate-50 rounded-xl overflow-hidden relative flex items-center justify-center shrink-0">
            <img 
              src={prod.imagen_url} 
              alt={prod.nombre} 
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />
            {/* Badges de Marca y Género */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
              <span className="bg-slate-950 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider">
                {prod.marca}
              </span>
              <span className="bg-[#FF0A57] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider">
                {prod.sexo}
              </span>
            </div>
          </div>

          {/* BODY: Información del modelo */}
          <div className="mt-2.5 flex-1 flex flex-col justify-between gap-2">
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight line-clamp-1 capitalize">
                {prod.nombre}
              </h4>
              <p className="text-[10px] text-slate-400 font-bold mt-1 truncate">
                Colores: <span className="text-slate-500">{prod.colores || 'Estándar'}</span>
              </p>
              
              {/* Muestra rápida de talles optimizada */}
              <div className="mt-2">
                <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block mb-1">
                  Talles disp:
                </span>
                <div className="flex flex-wrap gap-1">
                  {prod.talles?.slice(0, 3).map(t => (        
                    <span key={t} className="bg-slate-50 text-slate-500 font-black text-[9px] px-1.5 py-0.5 rounded-md border border-slate-100">
                      {t}
                    </span>
                  ))}
                  {prod.talles?.length > 3 && (
                    <span className="text-slate-300 font-bold text-[9px] px-0.5 py-0.5">...</span>
                  )}
                </div>
              </div>
            </div>

            {/* BOTTOM: Precio y Fila de Botones Adaptativa */}
            <div className="mt-1 pt-2 border-t border-slate-100">
              <div className="flex flex-col gap-0.5 mb-2.5">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Precio</span>
                <span className="text-sm sm:text-base font-black text-slate-950 leading-none">
                  ${prod.precio_menor?.toLocaleString('es-AR')}
                </span>
              </div>

              {/* CONTENEDOR DE BOTONES: En vertical para celular (flex-col), en horizontal para PC (sm:grid-cols-2) */}
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1.5">
                
                {/* Botón Ver Detalle */}
                <button
                  type="button"
                  onClick={() => onVerDetalle(prod)}
                  className="w-full bg-slate-950 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  🔍 Detalle
                </button>

                {/* Botón Añadir Rápido */}
                <button
                  type="button"
                  onClick={() => onVerDetalle(prod)}
                  className="w-full bg-[#FF0A57] hover:bg-[#FF0A57]/90 text-white text-[10px] font-black uppercase tracking-wider py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  🛍️ Añadir
                </button>
                
              </div>

            </div>
          </div>

        </div>
      ))}
    </div>
  );
}