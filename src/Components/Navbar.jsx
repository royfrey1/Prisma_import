export default function Navbar({ 
  sesion, 
  setMostrarLogin, 
  setMostrarCarrito, 
  carrito
}) {
  
  // Calculamos la cantidad total de pares sumando las cantidades de cada ítem
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        
        {/* Fila superior en móvil / Bloque Izquierdo en Desktop */}
        <div className="flex justify-between items-center w-full md:w-auto">
          <button onClick={() => {
              document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
            }}>
            <span className="cursor-pointer text-xl font-black tracking-tighter text-[#FF6696]/50">
              PRISMA<span className="text-[#FF6696]">_IMPORT</span>
            </span>
            <span className="text-[9px] block font-bold text-[#D892A8] tracking-wider uppercase -mt-0.5">
              Mayor & Menor
            </span>
          </button>
          
          {/* Botón Carrito Móvil (Se muestra solo en celulares) */}
          <button 
            onClick={() => setMostrarCarrito(true)} 
            className="md:hidden bg-[#FF0A57] text-white px-3.5 py-2 rounded-xl text-xs font-chewy flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            🛒 Carrito ({totalItems})
          </button>
        </div>

        {/* Fila inferior en móvil / Bloque Derecho en Desktop */}
        <div className="w-full md:w-auto flex items-center justify-end gap-3 border-t border-slate-50 pt-1 md:pt-0 md:border-t-0">

          {/* Botón dinámico para el Panel de Melani */}
          {sesion ? (
            <div className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl md:rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black tracking-wider uppercase text-emerald-700 font-mono">
                Modo Administrador Activo
              </span>
            </div>
          ) : (
            <button
              onClick={() => setMostrarLogin(true)}
              className="w-full md:w-auto flex items-center justify-center gap-1.5 border border-slate-200 hover:border-[#FF6696] text-slate-500 hover:text-[#FF6696] font-chewy text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl md:rounded-full transition-all cursor-pointer bg-white shadow-xs"
            >
              ⚙️ Ingreso Gestión
            </button>
          )}

          {/* Botón Carrito Escritorio (Se oculta en celulares) */}
          <button 
            onClick={() => setMostrarCarrito(true)} 
            className="hidden md:flex relative bg-[#FF0A57]/90 text-white px-5 py-2 rounded-xl text-sm font-chewy items-center gap-2 hover:bg-[#FF0A57] transition-all cursor-pointer shadow-xs"
          >
            🛒 Mi Carrito
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-chewy">
                {totalItems}
              </span>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
}