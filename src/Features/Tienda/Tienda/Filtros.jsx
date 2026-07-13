import React from 'react';

export default function Filtros({
  filtroMarca,
  setFiltroMarca,
  filtroTalle,
  setFiltroTalle,
  filtroSexo,
  setFiltroSexo,
  ordenPrecio,        
  setOrdenPrecio,     
  listaTallesDisponibles,
  busqueda,
  setBusqueda
}) {
  return (
    <section id="catalogo" className="scroll-mt-19 bg-white border-b border-slate-200 py-6 px-4 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-4 text-xs font-bold text-slate-600">
        
        {/* Bloque de selectores */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-slate-400 uppercase tracking-wider text-[10px]">Filtrar por:</span>
          
          {/* Filtro Marca */}
          <div className="flex items-center gap-1.5">
            <label>Marca:</label>
            <select value={filtroMarca} onChange={e => setFiltroMarca(e.target.value)} className="bg-slate-100 border-0 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-indigo-500">
              <option value="Todos">Todas</option>
              <option value="Nike">Nike</option>
              <option value="Adidas">Adidas</option>
              <option value="Vans">Vans</option>
              <option value="Puma">Puma</option>
              <option value="Reebok">Reebok</option>
              <option value="New Balance">New Balance</option>
              <option value="Converse">Converse</option>
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

          {/* 🌟 NUEVO: Filtro Ordenar por Precio */}
          <div className="flex items-center gap-1.5">
            <label>Precio:</label>
            <select value={ordenPrecio} onChange={e => setOrdenPrecio(e.target.value)} className="bg-slate-100 border-0 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-indigo-500">
              <option value="Destacados">Destacados</option>
              <option value="MenorMayor">Menor a Mayor precio</option>
              <option value="MayorMenor">Mayor a Menor precio</option>
            </select>
          </div>
        </div>

        {/* Contenedor de Búsqueda y Reset */}
        <div className="flex-1 flex items-center gap-3 w-full min-w-[280px] md:max-w-md md:ml-auto">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar zapatillas, marcas..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-100 border border-transparent rounded-xl pl-9 pr-16 py-2 text-xs focus:outline-hidden focus:bg-white focus:border-[#FF6696] transition-all"
            />
            <button 
              type="button"
              className="absolute right-1 top-1 bottom-1 bg-[#FF6696] text-white text-[12px] font-bold px-5 rounded-lg hover:bg-[#FF0A57]/70 transition-colors cursor-pointer"
            >
              Buscar
            </button>
          </div>

          {/* Reset de filtros actualizando el nuevo orden */}
          {(filtroMarca !== 'Todos' || filtroTalle !== 'Todos' || filtroSexo !== 'Todos' || ordenPrecio !== 'Destacados' || busqueda !== '') && (
            <button 
              onClick={() => { 
                setFiltroMarca('Todos'); 
                setFiltroTalle('Todos'); 
                setFiltroSexo('Todos'); 
                setOrdenPrecio('Destacados'); // Resetea a destacados
                setBusqueda(''); 
              }}
              className="text-rose-500 hover:text-rose-600 underline text-[11px] whitespace-nowrap cursor-pointer shrink-0"
            >
              Limpiar
            </button>
          )}
        </div>

      </div>
    </section>
  );
}