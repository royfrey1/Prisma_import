import { useState, useEffect } from 'react';
// import { supabase } from './supabaseClient';

export default function TiendaZapatillasCompleta() {
  // --- CONTROL DE VISTAS (MODO DEMO/PRODUCTO) ---
  const [vistaActual, setVistaActual] = useState('tienda'); // 'tienda' o 'admin'

  // --- ESTADOS DE PRODUCTOS Y CARRITO ---
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [tipoVenta, setTipoVenta] = useState('menor'); // 'menor' o 'mayor'
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [setCargando] = useState(false);
  const totalCarrito = carrito.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);

  // --- ESTADOS DE FILTROS ---
  const [busqueda, setBusqueda] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('Todos');
  const [filtroTalle, setFiltroTalle] = useState('Todos');
  const [filtroSexo, setFiltroSexo] = useState('Todos');

  // --- ESTADO FORMULARIO DE CARGA (PANEL DE MELANI) ---
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    marca: '',
    sexo: 'Unisex',
    precio_menor: '',
    precio_mayor: '',
    imagen_url: '',
    colores: '', // Se ingresan separados por comas
    talles: []   // Array dinámico de talles seleccionados
  });

  // Talles disponibles que Melani podrá tildar en su panel
  const listaTallesDisponibles = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44];

  // --- MOCK DATA CON NUEVOS ATRIBUTOS ---
  const productosMock = [
    { id: 1, nombre: 'Air Max Impact 4', marca: 'Nike', precio_menor: 120000, precio_mayor: 85000, imagen_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500', talles: [40, 41, 42], sexo: 'Hombre', colores: ['Negro', 'Blanco'] },
    { id: 2, nombre: 'Ultraboost Light', marca: 'Adidas', precio_menor: 150000, precio_mayor: 110000, imagen_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', talles: [38, 39, 40], sexo: 'Unisex', colores: ['Rojo', 'Gris'] },
    { id: 3, nombre: 'Old Skool Classic', marca: 'Vans', precio_menor: 80000, precio_mayor: 55000, imagen_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500', talles: [36, 37, 38, 42], sexo: 'Unisex', colores: ['Lona Negro'] },
    { id: 4, nombre: 'Air Force 1 Shadow', marca: 'Nike', precio_menor: 135000, precio_mayor: 95000, imagen_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500', talles: [36, 37, 38], sexo: 'Mujer', colores: ['Pastel'] },
  ];

  useEffect(() => {
    setProductos(productosMock);
    setProductosFiltrados(productosMock);
  }, []);

  // --- LÓGICA DE FILTRADO EN TIEMPO REAL ---
  useEffect(() => {
    let resultado = productos.filter((prod) => {
      const coincideBusqueda = prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                               prod.marca.toLowerCase().includes(busqueda.toLowerCase());
      const coincideMarca = filtroMarca === 'Todos' || prod.marca === filtroMarca;
      const coincideSexo = filtroSexo === 'Todos' || prod.sexo === filtroSexo;
      const coincideTalle = filtroTalle === 'Todos' || prod.talles.includes(Number(filtroTalle));

      return coincideBusqueda && coincideMarca && coincideSexo && coincideTalle;
    });

    setProductosFiltrados(resultado);
  }, [busqueda, filtroMarca, filtroTalle, filtroSexo, productos]);

  // --- LÓGICA DEL CARRITO ---
  const agregarAlCarrito = (producto) => {
    const precioActual = tipoVenta === 'menor' ? producto.precio_menor : producto.precio_mayor;
    const existe = carrito.find(item => item.id === producto.id);
    
    if (existe) {
      setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1, precioUnitario: precioActual }]);
    }
  };

  // --- LÓGICA DE ACCIÓN: PANEL DE ADMINISTRACIÓN DE MELANI ---
  const handleTalleSeleccionado = (talle) => {
    if (nuevoProducto.talles.includes(talle)) {
      setNuevoProducto({ ...nuevoProducto, talles: nuevoProducto.talles.filter(t => t !== talle) });
    } else {
      setNuevoProducto({ ...nuevoProducto, talles: [...nuevoProducto.talles, talle] });
    }
  };

  const handleGuardarProductoMelani = (e) => {
    e.preventDefault();
    
    // Convertir la cadena de colores separada por comas a un array limpio
    const arrayColores = nuevoProducto.colores.split(',').map(c => c.trim()).filter(c => c !== '');

    const productoNuevoEstructurado = {
      id: productos.length + 1,
      nombre: nuevoProducto.nombre,
      marca: nuevoProducto.marca,
      sexo: nuevoProducto.sexo,
      precio_menor: parseFloat(nuevoProducto.precio_menor),
      precio_mayor: parseFloat(nuevoProducto.precio_mayor),
      imagen_url: nuevoProducto.imagen_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      talles: nuevoProducto.talles.length > 0 ? nuevoProducto.talles : [40], // Fallback talle estándar
      colores: arrayColores.length > 0 ? arrayColores : ['Multicolor']
    };

    // Agregar al inicio del catálogo local de la demo para validación inmediata
    const stockActualizado = [productoNuevoEstructurado, ...productos];
    setProductos(stockActualizado);

    alert(`¡Publicado con éxito! "${productoNuevoEstructurado.nombre}" se añadió al catálogo.`);

    /* // DESCOMENTAR PARA GUARDAR EN SUPABASE:
    const { data, error } = await supabase.from('zapatillas').insert([{
      nombre: nuevoProducto.nombre,
      marca: nuevoProducto.marca,
      sexo: nuevoProducto.sexo,
      precio_menor: parseFloat(nuevoProducto.precio_menor),
      precio_mayor: parseFloat(nuevoProducto.precio_mayor),
      imagen_url: nuevoProducto.imagen_url,
      talles: nuevoProducto.talles, // campo int4[] en Postgres
      colores: arrayColores       // campo text[] en Postgres
    }]);
    */

    // Resetear formulario y regresar al catálogo del cliente
    setNuevoProducto({ nombre: '', marca: '', sexo: 'Unisex', precio_menor: '', precio_mayor: '', imagen_url: '', colores: '', talles: [] });
    setVistaActual('tienda');
  };

  return (
    <div className="min-h-screen bg-[#FFE8EE] text-slate-800 font-sans antialiased">
      
      {/* BARRA DE NAVEGACIÓN ENTORNO DEMO (SWITCH DE VISTAS) */}
      <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center text-[11px] border-b border-slate-800 font-mono">
        <span className="text-slate-400">⚡ MODO: {vistaActual === 'tienda' ? 'VISTA CLIENTE' : 'PANEL GESTIÓN'}</span>
        <div className="flex bg-slate-800 p-0.5 rounded-md border border-slate-700">
          <button 
            onClick={() => setVistaActual('tienda')} 
            className={`px-3 py-1 rounded-sm transition-all cursor-pointer ${vistaActual === 'tienda' ? 'bg-[#FF6696] text-white font-bold' : 'text-slate-400'}`}
          >
            Tienda (Cliente)
          </button>
          <button 
            onClick={() => setVistaActual('admin')} 
            className={`px-3 py-1 rounded-sm transition-all cursor-pointer ${vistaActual === 'admin' ? 'bg-[#FF6696] text-white font-bold' : 'text-slate-400'}`}
          >
            Panel de carga (Admin)
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* VISTA A: PANEL TIENDA ONLINE               */}
      {/* ========================================== */}
      {vistaActual === 'tienda' && (
        <>
          {/* 1. NAVBAR DE TIENDA ONLINE */}
          <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              
              {/* Branding e indicador mayor/menor */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xl font-black tracking-tighter text-[#FF6696]/50">PRISMA<span className="text-[#FF6696]">_IMPORT</span></span>
                  <span className="text-[9px] block font-bold text-[#D892A8] tracking-wider uppercase">Mayor & Menor</span>
                </div>
                
                {/* Botón Carrito Móvil */}
                <button onClick={() => setMostrarCarrito(true)} className="md:hidden relative bg-[#FF0A57]/70 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  🛒 Carrito ({carrito.reduce((acc, item) => acc + item.cantidad, 0)})
                </button>
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
              </div>

              {/* Selector Mayor/Menor y Carrito de Escritorio */}
              <div className="flex items-center justify-between md:justify-end gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                  <button 
                    onClick={() => setTipoVenta('menor')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${tipoVenta === 'menor' ? 'bg-[#FF6696] text-white shadow-xs' : 'text-slate-500'}`}
                  >
                    Minorista
                  </button>
                  <button 
                    onClick={() => setTipoVenta('mayor')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${tipoVenta === 'mayor' ? 'bg-[#FF6696] text-white shadow-xs' : 'text-slate-500'}`}
                  >
                    Mayorista
                  </button>
                </div>

                <button 
                  onClick={() => setMostrarCarrito(true)} 
                  className="hidden md:flex relative bg-[#FF0A57]/70 text-white px-5 py-2 rounded-xl text-xs font-bold items-center gap-2 hover:bg-[#FF0A57] transition-all cursor-pointer"
                >
                  🛒 Mi Carrito
                  {carrito.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                      {carrito.reduce((acc, item) => acc + item.cantidad, 0)}
                    </span>
                  )}
                </button>
              </div>

            </div>
          </nav>

          {/* 2. BARRA DE FILTROS AVANZADOS */}
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

          {/* 3. GRILLA DE PRODUCTOS */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-4xl block mb-2">👟❌</span>
                <p className="text-slate-400 font-bold text-sm">No encontramos zapatillas que coincidan con esos filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productosFiltrados.map(prod => (
                  <div key={prod.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                    
                    {/* Imagen y badges */}
                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                      <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        <span className="bg-slate-900/90 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">{prod.marca}</span>
                        <span className="bg-[#FF6696]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">{prod.sexo}</span>
                      </div>
                    </div>

                    {/* Info, Colores y Talles */}
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm tracking-tight line-clamp-1">{prod.nombre}</h3>
                        {prod.colores && (
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Colores: {prod.colores.join(' / ')}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {prod.talles.map(talle => (
                            <span key={talle} className="bg-slate-100 text-[10px] font-semibold text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-200/40">{talle}</span>
                          ))}
                        </div>
                      </div>

                      {/* Precios y Acción */}
                      <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                        <div>
                          <span className="text-[9px] block font-bold text-slate-400 uppercase">Tarifa {tipoVenta}</span>
                          <span className="text-base font-black text-slate-900">
                            ${(tipoVenta === 'menor' ? prod.precio_menor : prod.precio_mayor).toLocaleString('es-AR')}
                          </span>
                        </div>
                        <button 
                          onClick={() => agregarAlCarrito(prod)}
                          className="bg-[#FF0A57]/70 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#FF0A57] transition-colors cursor-pointer"
                        >
                          🛒 Añadir
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </main>

          {/* 4. SECCIÓN DE INFORMACIÓN INSTITUCIONAL */}
          <section className="bg-white border-t border-b border-slate-200/60 py-12 px-4 mt-16 shadow-2xs">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-10">
                <h2 className="text-sm font-black tracking-widest text-[#FF6696] uppercase mb-2">Información Importante</h2>
                <p className="text-slate-500 font-bold text-xs">Todo lo que necesitás saber antes de coordinar tu pedido con nosotros.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Tarjeta 1: Envíos */}
                <div className="bg-[#FFE8EE]/30 border border-[#FFE8EE] p-5 rounded-2xl flex gap-4">
                  <span className="text-2xl">📍</span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Envíos Locales y Nacionales</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                      Hacemos entregas directas y envíos a todo el país. Coordinamos el método que te sea más cómodo al momento de confirmar el pedido por WhatsApp.
                    </p>
                  </div>
                </div>

                {/* Tarjeta 2: Mayorista */}
                <div className="bg-[#FFE8EE]/30 border border-[#FFE8EE] p-5 rounded-2xl flex gap-4">
                  <span className="text-2xl">📦</span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Condiciones Mayoristas</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                      Para acceder a la tarifa mayorista, recordá que la compra mínima debe cumplir con las unidades estipuladas. Podés armar tu pedido surtido en talle y marca.
                    </p>
                  </div>
                </div>

                {/* Tarjeta 3: Atención */}
                <div className="bg-[#FFE8EE]/30 border border-[#FFE8EE] p-5 rounded-2xl flex gap-4">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Atención Inmediata</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                      Una vez enviado tu carrito, nos pondremos en contacto para validar la curva de talles, disponibilidad de colores y acordar el método de pago.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. FOOTER */}
          <footer className="bg-slate-900 text-slate-400 text-xs py-12 px-4 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col gap-8 md:flex-row md:justify-between md:items-center">
              
              {/* Lado Izquierdo: Branding */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tighter text-[#FF6696]/40">PRISMA<span className="text-[#FF6696]">_IMPORT</span></span>
                  <span className="text-[9px] bg-slate-800 text-[#D892A8] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Showroom</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Distribuidora oficial de calzado deportivo de primera calidad.</p>
              </div>

              {/* Lado Derecho: Créditos de la Red */}
              <div className="flex flex-col md:items-end gap-1.5 border-t border-slate-800 pt-6 md:border-t-0 md:pt-0">
                <p className="text-[11px] font-medium">
                  &copy; {new Date().getFullYear()} Todos los derechos reservados. Desarrollado con por Roy Frey
                </p>
              </div>

            </div>
          </footer>
        </>
      )}

      {/* ========================================== */}
      {/* VISTA B: PANEL DE GESTIÓN (ADMIN - MELANI) */}
      {/* ========================================== */}
      {vistaActual === 'admin' && (
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            
            {/* Header del Formulario */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800">
              <div>
                <h2 className="text-lg font-black tracking-tight">Carga de Productos</h2>
                <p className="text-xs text-slate-400 mt-0.5">Gestión de stock en tiempo real — Prisma Import</p>
              </div>
              <span className="text-2xl">📦</span>
            </div>

            {/* Formulario */}
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

              {/* Selector Multi-Talle */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Curva de Talles Listos para Despacho (Tildar los disponibles)</label>
                <div className="flex flex-wrap gap-2">
                  {listaTallesDisponibles.map(talle => {
                    const seleccionado = nuevoProducto.talles.includes(talle);
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

              {/* Publicar */}
              <button 
                type="submit" 
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl uppercase tracking-wider text-xs hover:bg-[#FF6696] transition-all cursor-pointer mt-4 shadow-lg"
              >
                ⚡ Sincronizar y Enviar a Catálogo
              </button>

            </form>
          </div>
        </main>
      )}

        {/* MODAL DEL CARRITO AVANZADO */}
        {mostrarCarrito && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-end animate-fadeIn">
            {/* Fondo clickeable para cerrar */}
            <div className="absolute inset-0 -z-10" onClick={() => setMostrarCarrito(false)}></div>
            
            <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl relative">
              
              {/* HEADER DEL CARRITO */}
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg tracking-tight">🛒 Tu Pedido</h3>
                    <span className="text-[10px] font-bold bg-[#FFE8EE] text-[#FF6696] px-2 py-0.5 rounded-md uppercase mt-1 inline-block">
                      Modo: {tipoVenta === 'menor' ? 'Minorista' : 'Mayorista'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setMostrarCarrito(false)} 
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* LISTA DE PRODUCTOS AGREGADOS */}
                <div className="mt-6 space-y-4 overflow-y-auto max-h-[60vh] pr-1">
                  {carrito.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <span className="text-3xl block mb-2">🛍️</span>
                      <p className="text-xs font-bold">El carrito está vacío.</p>
                      <p className="text-[11px] mt-1">¡Agregá algunos modelos de la tienda!</p>
                    </div>
                  ) : (
                    carrito.map((item) => (
                      <div key={item.id} className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 relative group">
                        {/* Miniatura de la zapatilla */}
                        <img src={item.imagen_url} alt={item.nombre} className="w-16 h-16 rounded-xl object-cover bg-slate-200" />
                        
                        {/* Detalles y Controles de edición */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-tight line-clamp-1">{item.nombre}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">{item.marca}</p>
                          </div>
                          
                          {/* Controles para Editar Cantidades */}
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                              <button 
                                onClick={() => {
                                  if (item.cantidad === 1) {
                                    setCarrito(carrito.filter(i => i.id !== item.id));
                                  } else {
                                    setCarrito(carrito.map(i => i.id === item.id ? { ...i, cantidad: i.cantidad - 1 } : i));
                                  }
                                }}
                                className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-xs font-black text-slate-800 min-w-[12px] text-center">{item.cantidad}</span>
                              <button 
                                onClick={() => setCarrito(carrito.map(i => i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i))}
                                className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            
                            {/* Precio acumulado por producto */}
                            <span className="text-xs font-black text-slate-900">
                              ${(item.precioUnitario * item.cantidad).toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>

                        {/* Botón rápido para eliminar ítem completo */}
                        <button 
                          onClick={() => setCarrito(carrito.filter(i => i.id !== item.id))}
                          className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 text-[11px] transition-colors cursor-pointer"
                          title="Eliminar artículo"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* FOOTER DEL CARRITO: TOTALIZADOR Y ENVIAR A WHATSAPP */}
              <div className="border-t border-slate-100 pt-4 bg-white">
                <div className="flex justify-between items-center mb-4 px-1">
                  <div>
                    <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-wider">Subtotal Neto</span>
                    <span className="text-xs text-slate-500 font-medium">({carrito.reduce((acc, i) => acc + i.cantidad, 0)} artículos)</span>
                  </div>
                  <span className="text-xl font-black text-slate-900">
                    ${totalCarrito.toLocaleString('es-AR')}
                  </span>
                </div>

                {/* Botón de Enbío con generación de texto dinámico */}
                <button 
                  disabled={carrito.length === 0}
                  onClick={() => {
                    // Número de celular de Melani (Reemplazar por el real sin espacios, ej: 5493757xxxxxx)
                    const numeroMelani = "5493757123456"; 
                    
                    // Construimos el mensaje estéticamente ordenado
                    let mensaje = `👋 ¡Hola Melani! Quiero realizar un pedido en *PRISMA_IMPORT* (Compra ${tipoVenta.toUpperCase()}):\n\n`;
                    
                    carrito.forEach((item, index) => {
                      mensaje += `🔹 *${index + 1}. ${item.nombre}*\n`;
                      mensaje += `   • Marca: ${item.marca}\n`;
                      mensaje += `   • Cantidad: ${item.cantidad} u.\n`;
                      mensaje += `   • Subtotal: $${(item.precioUnitario * item.cantidad).toLocaleString('es-AR')}\n\n`;
                    });
                    
                    mensaje += `⚙️ *TOTAL ESTIMADO:* $${totalCarrito.toLocaleString('es-AR')}\n`;
                    mensaje += `\n¿Me confirmarías si tenés stock disponible de estos modelos? 🙌`;

                    // Codificamos el texto para que sea compatible con una URL web
                    const mensajeEncriptado = encodeURIComponent(mensaje);
                    
                    // Redirección directa a la API de WhatsApp (Funciona nativo en PC y Celulares)
                    window.open(`https://wa.me/${numeroMelani}?text=${mensajeEncriptado}`, '_blank');
                  }}
                  className={`w-full font-bold py-4 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    carrito.length === 0 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-[#FF0A57]/80 text-white hover:bg-[#FF0A57] cursor-pointer'
                  }`}
                >
                  💬 Enviar Pedido
                </button>
              </div>

            </div>
          </div>
        )}

    </div>
  );
}