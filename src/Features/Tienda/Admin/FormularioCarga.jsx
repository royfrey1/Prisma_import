import React from 'react';
import SelectorTalles from './SelectorTalles';

export default function FormularioCarga({
  nuevoProducto,
  setNuevoProducto,
  listaTallesDisponibles,
  handleTalleSeleccionado,
  handleSubirImagen,
  handleGuardarProductoMelani
}) {
  return (
    <form onSubmit={handleGuardarProductoMelani} className="p-6 sm:p-8 flex flex-col gap-5">
      
      {/* Modelo y Marca */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nombre del Modelo</label>
          <input type="text" required placeholder="Ej: Air Force One Retro" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-[#FF6696] focus:bg-white transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Marca / Proveedor</label>
          <input type="text" required placeholder="Ej: Nike, Adidas, Puma" value={nuevoProducto.marca} onChange={e => setNuevoProducto({...nuevoProducto, marca: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-[#FF6696] focus:bg-white transition-all" />
        </div>
      </div>

      {/* Tarifas y Género */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Precio Minorista ($)</label>
          <input type="number" required placeholder="140000" value={nuevoProducto.precio_menor} onChange={e => setNuevoProducto({...nuevoProducto, precio_menor: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-[#FF6696] focus:bg-white transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Precio Mayorista ($)</label>
          <input type="number" required placeholder="98000" value={nuevoProducto.precio_mayor} onChange={e => setNuevoProducto({...nuevoProducto, precio_mayor: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-[#FF6696] focus:bg-white transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Segmento / Género</label>
          <select value={nuevoProducto.sexo} onChange={e => setNuevoProducto({...nuevoProducto, sexo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-[#FF6696] focus:bg-white transition-all">
            <option value="Unisex">Unisex</option>
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
          </select>
        </div>
      </div>

      {/* Variantes de Color */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Gama de Colores Disponibles</label>
        <input type="text" placeholder="Ej: Total Black, Blanco/Rosa, Gris Urbano (Separados por comas)" value={nuevoProducto.colores} onChange={e => setNuevoProducto({...nuevoProducto, colores: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-[#FF6696] focus:bg-white transition-all" />
      </div>

      {/* Subida de Imagen */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
          Foto de la Zapatilla (Desde celular o compu)
        </label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => handleSubirImagen(e.target.files[0])} 
          className="w-full bg-slate-50 border border-dashed border-slate-300 rounded-xl px-4 py-4 text-sm"
        />
      </div>

      {/* Selector Multi-Talle Integrado */}
      <SelectorTalles 
        listaTallesDisponibles={listaTallesDisponibles}
        tallesSeleccionados={nuevoProducto.talles}
        handleTalleSeleccionado={handleTalleSeleccionado}
      />

      {/* Publicar */}
      <button 
        type="submit" 
        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl uppercase tracking-wider text-xs hover:bg-[#FF6696] transition-all cursor-pointer mt-4 shadow-lg"
      >
        ⚡ Sincronizar y Enviar a Catálogo
      </button>

    </form>
  );
}