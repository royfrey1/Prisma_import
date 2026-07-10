import React, { useState, useEffect } from 'react';

export default function LoginModal({ mostrarLogin, setMostrarLogin, handleLoginAdministrador, cargando }) {

  // 🔒 SOLUCIÓN 2: Controla el scroll usando el estado real 'mostrarLogin'
  useEffect(() => {
    if (mostrarLogin) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  
    return () => {
      document.body.style.overflow = '';
    };
  }, [mostrarLogin]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginAdministrador(email, password);
  };

  return (
    <div 
      className={`fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        mostrarLogin ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0" onClick={() => setMostrarLogin(false)}></div>
      
      <div 
        className={`bg-white max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative z-10 transition-all duration-300 transform ${
          mostrarLogin ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        
        {/* CABECERA */}
        <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
          <div>
            <h3 className="font-black text-sm tracking-tight uppercase">Autenticación de Gestión</h3>
            <p className="text-[10px] text-slate-400 font-medium">Uso exclusivo para propietarios.</p>
          </div>
          <button 
            type="button"
            onClick={() => setMostrarLogin(false)} 
            className="text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required 
              placeholder="ejemplo@prisma.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#FF6696] text-slate-800" 
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contraseña</label>
            <div className="relative">
              <input 
                type={mostrarPassword ? "text" : "password"} 
                required 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs focus:outline-hidden focus:border-[#FF6696] text-slate-800" 
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer select-none"
              >
                {mostrarPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl uppercase tracking-wider text-[11px] hover:bg-[#FF6696] transition-all cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? "Validando accesos..." : "Ingresar al Sistema"}
          </button>
        </form>

      </div>
    </div>
  );
}