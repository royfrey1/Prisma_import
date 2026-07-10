import React from 'react';

export default function TarjetaProducto({ prod, tipoVenta, agregarAlCarrito, onVerDetalle }) {
  // 📹 Limpiamos la URL para evitar errores si Supabase le mete parámetros extras (?token=...)
  const urlLimpia = prod.imagen_url ? prod.imagen_url.split('?')[0].toLowerCase() : '';

  // Evaluar con certeza si es un video
  const esVideo = urlLimpia && (
    urlLimpia.endsWith('.mp4') || 
    urlLimpia.endsWith('.mov') || 
    urlLimpia.endsWith('.webm') || 
    urlLimpia.includes('video') ||
    urlLimpia.includes('/storage/v1/object/public/videos')
  ); 

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
      
      {/* Contenedor Multimedia (Imagen o Video) y Badges */}
      <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center group">
        {/* 📷 Renderizado único y directo: Siempre será una foto real gracias al blindaje del panel */}
        <img 
          src={prod.imagen_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'} 
          alt={prod.nombre} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
        />

        {/* Badges flotantes */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <span className="bg-slate-900/90 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
            {prod.marca}
          </span>
          <span className="bg-[#FF6696]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
            {prod.sexo}
          </span>
        </div>
      </div>

      {/* Info, Colores y Talles */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm tracking-tight line-clamp-1">{prod.nombre}</h3>
          {prod.colores && (
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
              Colores: {Array.isArray(prod.colores) ? prod.colores.join(' / ') : prod.colores}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {prod.talles?.map(talle => (
              <span key={talle} className="bg-slate-100 text-[10px] font-semibold text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-200/40">{talle}</span>
            ))}
          </div>
        </div>

        {/* Precios y Acción */}
        <div className="flex items-end justify-between border-t border-slate-100 pt-3">
          <div>
            <span className="text-[9px] block font-bold text-slate-400 uppercase">Precio </span>
            <span className="text-base font-black text-slate-900">
              ${(tipoVenta === 'menor' ? prod.precio_menor : prod.precio_mayor).toLocaleString('es-AR')}
            </span>
          </div>
          
          <div className="flex gap-1.5">
            <button onClick={() => onVerDetalle(prod)} className="bg-[#FF0A57]/70 text-white px-2 py-1 rounded-md text-xs font-bold hover:bg-[#FF0A57] transition-colors cursor-pointer">
              Ver Detalle
            </button>
            <button 
              onClick={() => agregarAlCarrito(prod)}
              className="bg-[#FF0A57]/70 text-white xs:px-2.5 xs:py-1.5 sm:px-3 sm:py-2 md:px-3.5 md:py-2.5 rounded-md text-xs font-bold hover:bg-[#FF0A57] transition-colors cursor-pointer"
            >
              🛒
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}