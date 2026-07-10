import React from 'react';
import TarjetaProducto from './TarjetaProducto';

export default function GrillaProductos({ productosFiltrados, agregarAlCarrito, onVerDetalle }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-4 max-w-7xl mx-auto">
      {productosFiltrados.map((prod) => (
        <div 
          key={prod.id}
          className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs flex flex-col justify-between p-3 group hover:shadow-md transition-all duration-300"
        >
          {/* TOP: Imagen y Badges (Esto ya lo tenés lindo) */}
          <div className="h-40 md:h-48 bg-slate-50 rounded-2xl overflow-hidden relative flex items-center justify-center">
            <img 
              src={prod.imagen_url} 
              alt={prod.nombre} 
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />
            {/* Badges de Marca y Género */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
              <span className="bg-slate-950 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                {prod.marca}
              </span>
              <span className="bg-[#FF0A57] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                {prod.sexo}
              </span>
            </div>
          </div>

          {/* BODY: Información del modelo */}
          <div className="mt-3 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-md font-black text-slate-900 tracking-tight line-clamp-1 capitalize">
                {prod.nombre}
              </h4>
              <p className="text-[10px] text-slate-400 font-bold mt-2">
                Colores: <span className="text-slate-500">{prod.colores || 'Estándar'}</span>
              </p>
              
              {/* Muestra rápida de talles */}
              <div className="flex flex-wrap gap-1 mt-2.5">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mr-1">Talles disponibles:</p>
                {prod.talles?.slice(0, 3).map(t => (             
                  <span key={t} className="bg-slate-50 text-slate-400 font-bold text-[9px] px-1.5 py-0.5 rounded-md border border-slate-100">
                    {t}
                  </span>
                ))}
                {prod.talles?.length > 3 && (
                  <span className="text-slate-300 font-bold text-[9px] px-1 py-0.5">...</span>
                )}
              </div>
            </div>

            {/* BOTTOM: Precio y Fila de Botones Mejorada */}
            <div className="mt-4 pt-3 border-t border-slate-50">
              <div className="flex flex-col gap-1 mb-3">
                <span className="text-[12px] text-slate-400 font-black uppercase tracking-wider">Precio</span>
                <span className="text-base font-black text-slate-950 leading-none">
                  ${prod.precio_menor?.toLocaleString('es-AR')}
                </span>
              </div>

              {/* CONTENEDOR DE BOTONES: Con dimensiones simétricas y perfectas */}
              <div className="grid grid-cols-2 gap-2">
                {/* Botón Ver Detalle (Abre el Modal Premium) */}
                <button
                  type="button"
                  onClick={() => onVerDetalle(prod)} // 👈 Dispara el modal en TiendaPage
                  className="bg-slate-950 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  🔍 Detalle
                </button>

                {/* Botón Añadir Rápido */}
                <button
                  type="button"
                  onClick={() => onVerDetalle(prod)} // 👈 Cambiado: Es mejor que vaya al detalle para elegir talle/color antes de añadir, o podés dejarlo directo
                  className="bg-[#FF0A57] hover:bg-[#FF0A57]/90 text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
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