export default function Navbar({ 
  sesion, 
  setMostrarLogin, 
  setMostrarCarrito, 
  carrito
}) {
  
  // Calculamos la cantidad total de pares sumando las cantidades de cada ítem
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* Branding e indicador */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xl font-black tracking-tighter text-[#FF6696]/50">
              PRISMA<span className="text-[#FF6696]">_IMPORT</span>
            </span>
            <span className="text-[9px] block font-bold text-[#D892A8] tracking-wider uppercase">
              Mayor & Menor
            </span>
          </div>
          
          {/* Botón Carrito Móvil */}
          <button 
            onClick={() => setMostrarCarrito(true)} 
            className="md:hidden relative bg-[#FF0A57]/70 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            🛒 Carrito ({totalItems})
          </button>
        </div>


        {/* Panel de Melani y Carrito de Escritorio */}
        <div className="flex items-center justify-between md:justify-end gap-4">

          {/* Botón dinámico para el Panel de Melani */}
          {sesion ? (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-700 font-mono">
                Modo Administrador Activo
              </span>
            </div>
          ) : (
            <button
              onClick={() => setMostrarLogin(true)}
              className="sm:flex items-center gap-1.5 border border-slate-200 hover:border-[#FF6696] text-slate-600 hover:text-[#FF6696] font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-full transition-all cursor-pointer bg-white shadow-xs"
            >
              ⚙️ Ingreso Gestión
            </button>
          )}

          {/* Botón Carrito Escritorio */}
          <button 
            onClick={() => setMostrarCarrito(true)} 
            className="hidden md:flex relative bg-[#FF0A57]/70 text-white px-5 py-2 rounded-xl text-xs font-bold items-center gap-2 hover:bg-[#FF0A57] transition-all cursor-pointer"
          >
            🛒 Mi Carrito
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
}