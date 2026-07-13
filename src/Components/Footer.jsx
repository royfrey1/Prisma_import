export default function Footer() {

  const textoMarquesina = " • ENVÍOS A TODO EL PAÍS • PRISMA IMPORT • CALIDAD PREMIUM • LAS MEJORES MARCAS • PRECIOS DE FÁBRICA • REVENTA";

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs mt-auto overflow-hidden">
      
      {/* ─── MARQUESINA DE CIERRE EN EL INICIO DEL FOOTER ─── */}
      <div className="w-full bg-[#FF0A57] py-2 border-b border-slate-800 flex overflow-x-hidden select-none">
        <div className="flex whitespace-nowrap animate-marquee font-cinzel text-[11px] md:text-xs uppercase tracking-widest text-white">
          {/* Duplicamos el string para garantizar continuidad infinita en pantallas anchas */}
          <span>{textoMarquesina}{textoMarquesina}{textoMarquesina}</span>
          <span>{textoMarquesina}{textoMarquesina}{textoMarquesina}</span>
        </div>
      </div>

      {/* ─── CONTENIDO INTERNO DEL FOOTER ─── */}
      <div className="max-w-7xl mx-auto py-12 px-4 flex flex-col gap-8 md:flex-row md:justify-between md:items-center">
        
        {/* Lado Izquierdo: Branding */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tighter text-[#FF6696]/40">
              PRISMA<span className="text-[#FF6696]">_IMPORT</span>
            </span>
            <span className="text-[9px] bg-slate-800 text-[#D892A8] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
              Showroom
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Distribuidora oficial de calzado deportivo de primera calidad.
          </p>
        </div>

        {/* Lado Derecho: Créditos de la Red */}
        <div className="flex flex-col md:items-end gap-1.5 border-t border-slate-800 pt-6 md:border-t-0 md:pt-0">
          <p className="text-sm font-medium">
            &copy; {new Date().getFullYear()} Todos los derechos reservados. Desarrollado por 
            <a 
              href="https://portfolio-royf.vercel.app/"
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-chewy text-[#FF6696] hover:underline transition-all duration-300 ml-1"
            >
              Roy Frey
            </a>
          </p>
        </div>
        
      </div>
    </footer>
  );
}