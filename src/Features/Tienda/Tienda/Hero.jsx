import React from 'react';
import GrillaProductos from './GrillaProductos';
import logo from '../../../assets/bg.jpg';

export default function Hero() {
  // Frases que se repetirán de corrido en la marquesina
  const textoMarquesina = "  •  ENVÍOS A TODO EL PAÍS  •  PRISMA IMPORT  •  CALIDAD PREMIUM  •  LAS MEJORES MARCAS  •  REVENTA ";

  return (
    <section id="hero" className="relative scroll-mt-20 text-white overflow-hidden select-none">     

        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src={logo} 
            alt="Fondo" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-pink-300/50 via-pink-400/80 to-pink-100/50 md:bg-gradient-to-r md:from-pink-500/90 md:via-pink-400/80 to-transparent"></div>
        </div>

      {/* CONTENIDO PRINCIPAL DEL HERO */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative z-10 flex flex-col items-center text-center">
        
        
        {/* Badge superior */}
        <span className="bg-[#FF0A57]/10 text-[#FF0A57] border border-[#FF0A57]/30 text-[13px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-6 animate-pulse">
          💥 Nueva Temporada Disponible 💥
        </span>

        {/* Título impactante */}
        <h1 className="text-4xl md:text-7xl font-protest tracking-tighter uppercase leading-none max-w-4xl">
          Pisá Fuerte.<br/>
          Estilo Único con <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0A57] to-rose-500"><br></br>Prisma_Import</span>
        </h1>

        {/* Subtítulo descriptivo */}
        <p className="mt-6 text-sm md:text-base text-slate-200 max-w-xl font-medium leading-relaxed">
          Explorá nuestro catálogo minorista con stock real y actualizado. Conseguí las zapatillas premium que estás buscando al mejor precio del mercado.
        </p>

        {/* Botón de llamada a la acción */}
        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => {
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#FF0A57] hover:bg-[#FF0A57]/90 text-white font-protest text-md uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg shadow-[#FF0A57]/20 transition-all cursor-pointer active:scale-95"
          >
            🔥 Ver Modelos
          </button>
        </div>
      </div>

      {/* ─── MARQUESINA AL FINAL DEL HERO ─── */}
      <div className="w-full bg-[#FF0A57] py-2 border-t border-b border-black/10 flex overflow-x-hidden relative z-20 shadow-md">
        <div className="flex whitespace-nowrap animate-marquee font-cinzel text-[10px] md:text-xs uppercase tracking-widest text-white">
          {/* Duplicamos el texto para asegurar el bucle infinito sin saltos visuales */}
          <span>{textoMarquesina}{textoMarquesina}{textoMarquesina}</span>
          <span>{textoMarquesina}{textoMarquesina}{textoMarquesina}</span>
        </div>
      </div>

    </section>
  );
}