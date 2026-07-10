import React from 'react';

export default function SelectorTalles({ 
  listaTallesDisponibles, 
  tallesSeleccionados, 
  handleTalleSeleccionado 
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
        Curva de Talles Listos para Despacho (Tildar los disponibles)
      </label>
      <div className="flex flex-wrap gap-2">
        {listaTallesDisponibles.map(talle => {
          const seleccionado = tallesSeleccionados.includes(talle);
          return (
            <button
              type="button"
              key={talle}
              onClick={() => handleTalleSeleccionado(talle)}
              className={`w-11 h-11 rounded-xl text-xs font-black border transition-all flex items-center justify-center cursor-pointer ${
                seleccionado 
                  ? 'bg-[#FF6696] border-[#FF6696] text-white shadow-md scale-105' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {talle}
            </button>
          );
        })}
      </div>
    </div>
  );
}