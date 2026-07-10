import React from 'react';

export default function Filtros({
  filtroMarca,
  setFiltroMarca,
  filtroTalle,
  setFiltroTalle,
  filtroSexo,
  setFiltroSexo,
  listaTallesDisponibles,
  busqueda,
  setBusqueda
}) {
  return (
    <section className="bg-white border-b border-slate-200 py-3 px-4 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600">
        <span className="text-slate-400 uppercase tracking-wider text-[10px]">Filtrar por:</span>
        
        {/* Filtro Marca */}
        <div className="flex items-center gap-1.5">
          <label>Marca:</label>
          <select value={filtroMarca} onChange={e => setFiltroMarca(e.target.value)} className="bg-slate-100 border-0 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-indigo-500">
            <option value="Todos">Todas</option>
            <option value="Nike">Nike</option>
            <option value="Adidas">Adidas</option>
            <option value="Vans">Vans</option>
          </select>
        </div>

        {/* Filtro Talles */}
        <div className="flex items-center gap-1.5">
          <label>Talle:</label>
          <select value={filtroTalle} onChange={e => setFiltroTalle(e.target.value)} className="bg-slate-100 border-0 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-indigo-500">
            <option value="Todos">Todos</option>
            {listaTallesDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Filtro Sexo */}
        <div className="flex items-center gap-1.5">
          <label>Género:</label>
          <select value={filtroSexo} onChange={e => setFiltroSexo(e.target.value)} className="bg-slate-100 border-0 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-indigo-500">
            <option value="Todos">Todos</option>
            <option value="Hombre">Hombre</option>
            <option value="Mujer">Mujer</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>

        {/* Barra de Búsqueda Integrada */}
        <div className="flex-1 max-w-md mx-auto w-full relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar zapatillas, marcas..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-100 border border-transparent rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-hidden focus:bg-white focus:border-[#FF6696] transition-all"
          />
          <button 
            type="button"
            className="absolute right-1 top-1 bottom-1 bg-[#FF6696] text-white text-[11px] font-bold px-3 rounded-lg hover:bg-[#FF0A57]/70 transition-colors cursor-pointer"
          >
            Buscar
          </button>
        </div>

        {/* Reset de filtros */}
        {(filtroMarca !== 'Todos' || filtroTalle !== 'Todos' || filtroSexo !== 'Todos' || busqueda !== '') && (
          <button 
            onClick={() => { setFiltroMarca('Todos'); setFiltroTalle('Todos'); setFiltroSexo('Todos'); setBusqueda(''); }}
            className="text-rose-500 hover:text-rose-600 underline ml-auto cursor-pointer"
          >
            Limpiar Filtros
          </button>
        )}
      </div>
    </section>
  );
}