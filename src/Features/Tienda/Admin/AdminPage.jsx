import React, { useState, forwardRef } from 'react';
import Swal from 'sweetalert2';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { supabase } from '../../../Datos/supabaseClient'; 

const AdminPage = forwardRef((props, ref) => {
  const {
    nuevoProducto,
    setNuevoProducto,
    listaTallesDisponibles,
    handleTalleSeleccionado,
    handleGuardarProductoMelani,
    handleCerrarSesion,
    productos,           
    handleEliminarProducto,   
    handleCargarEdicion,      
    obtenerProductosSupabase,
    handleCancelarEdicion
  } = props;

  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  // 🌟 ESTADO NUEVO: Guarda qué producto tiene abierto el desplegable de gestión de stock
  const [productoStockAbierto, setProductoStockAbierto] = useState(null);
  const [cargandoStock, setCargandoStock] = useState(false);

  // 🌟 FUNCIÓN NUEVA: Modifica la cantidad de un talle existente (+1 / -1)
  const handleModificarCantidadStock = async (varianteId, cantidadActual, operacion) => {
    if (cargandoStock) return;
    const nuevaCantidad = operacion === 'sumar' ? cantidadActual + 1 : cantidadActual - 1;
    
    if (nuevaCantidad < 0) return; // Protección contra negativos

    setCargandoStock(true);
    try {
      const { error } = await supabase
        .from('stock_variantes')
        .update({ cantidad: nuevaCantidad })
        .eq('id', varianteId);

      if (error) throw error;
      
      // Recargamos el listado global para actualizar la UI en vivo
      await obtenerProductosSupabase();
    } catch (err) {
      console.error("Error al actualizar stock:", err);
      Swal.fire('Error', 'No se pudo actualizar el stock.', 'error');
    } finally {
      setCargandoStock(false);
    }
  };

  // 🌟 FUNCIÓN CORREGIDA: Crea el talle o lo reactiva con stock si ya existía
  const handleCrearNuevaVarianteTalle = async (productoId, talle) => {
    if (!talle) return;
    setCargandoStock(true);
    try {
      // 1. Intentamos insertar el talle de forma normal
      const { error } = await supabase
        .from('stock_variantes')
        .insert([{ producto_id: productoId, talle: talle, cantidad: 1 }]);

      if (error) {
        // 🛠️ CAPTURA DE DUPLICADO: Si ya existe en Supabase (Unique Constraint activo)
        if (error.code === '23505') {
          
          // 2. En vez de dar error, le hacemos un UPDATE asignándole 1 unidad (ya que estaba en 0 u oculto)
          const { error: updateError } = await supabase
            .from('stock_variantes')
            .update({ cantidad: 1 })
            .eq('producto_id', productoId)
            .eq('talle', talle);

          if (updateError) throw updateError;
          
          // Avisamos con un mensaje amigable de que se reactivó con éxito
          Swal.fire({
            icon: 'success',
            title: 'Talle actualizado',
            text: `El talle ${talle} ya existía y se restableció a 1 unidad.`,
            timer: 1500,
            showConfirmButton: false
          });
          
          await obtenerProductosSupabase();
          return;
        }
        throw error;
      }

      // Si el insert salió bien de primera (talle nuevo real)
      Swal.fire({
        icon: 'success',
        title: 'Talle añadido',
        text: `Se agregó el talle ${talle} con 1 unidad.`,
        timer: 2000,
        showConfirmButton: false
      });

      await obtenerProductosSupabase();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo añadir o actualizar el talle.', 'error');
    } finally {
      setCargandoStock(false);
    }
  };

  const alCambiarArchivoMúltiple = (e) => {
    const archivos = Array.from(e.target.files);
    if (archivos.length === 0) return;

    setArchivosSeleccionados(prev => [...prev, ...archivos]);

    const nuevasPreviews = archivos.map(archivo => ({
      url: URL.createObjectURL(archivo),
      esVideo: archivo.type.includes('video')
    }));

    setPreviewUrls(prev => [...prev, ...nuevasPreviews]);
  };

  const eliminarFotoDePreview = (indexAEliminar) => {
    setArchivosSeleccionados(prev => prev.filter((_, i) => i !== indexAEliminar));
    setPreviewUrls(prev => prev.filter((_, i) => i !== indexAEliminar));
  };

  const alEnviarFormulario = async (e) => {
    e.preventDefault();

    if (archivosSeleccionados.length > 0) {
      const primerArchivo = archivosSeleccionados[0];
      const esVideo = primerArchivo.type.includes('video') || 
                      primerArchivo.name.toLowerCase().endsWith('.mp4') || 
                      primerArchivo.name.toLowerCase().endsWith('.mov');

      if (esVideo) {
        Swal.fire({
          icon: 'warning',
          title: 'Foto de portada requerida',
          text: 'Por favor, selecciona una foto como primer archivo para que actúe como portada en la tienda.',
          confirmButtonColor: '#FF6696',
          customClass: { popup: 'rounded-2xl' }
        });
        return;
      }
    }

    await handleGuardarProductoMelani(
      e, 
      archivosSeleccionados, 
      setArchivosSeleccionados, 
      setPreviewUrls
    );
  };

  return (
    <div className="min-h-screen bg-[#FFE8EE] text-slate-800 font-sans p-4 sm:p-6 md:p-8">
      
      {/* HEADER DE GESTIÓN */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-2xl border border-[#FF6696] shadow-2xs gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            ⚙️ Panel de Control Principal
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-0.5">Bienvenido al espacio de administración de Prisma Import.</p>
        </div>
        <button 
          onClick={handleCerrarSesion}
          className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs text-center"
        >
          Cerrar Sesión 🔓
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* COLUMNA FORMULARIO DE CARGA / EDICIÓN (5 Columnas) */}
        <section ref={ref} className="lg:col-span-5 bg-white p-4 sm:p-6 rounded-2xl border border-[#FF6696] shadow-2xs h-fit">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-5 pb-3 border-b border-[#FF6696]/40 font-chewy">
            {nuevoProducto.id ? "📝 Editar Producto" : "👟 Cargar Nuevo Modelo"}
          </h2>

          <form onSubmit={alEnviarFormulario} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Nombre del Modelo</label>
              <input 
                type="text" required placeholder="Ej: Air Max Infinity"
                value={nuevoProducto.nombre}
                onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6696] focus:ring-2 focus:ring-[#FF6696]/20 rounded-xl px-3 py-2.5 text-xs transition-all outline-hidden text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Marca</label>
                <select 
                  value={nuevoProducto.marca}
                  onChange={e => setNuevoProducto({...nuevoProducto, marca: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6696] focus:ring-2 focus:ring-[#FF6696]/20 rounded-xl px-3 py-2.5 text-xs transition-all outline-hidden text-slate-800"
                >
                  <option value="">Seleccionar</option>
                  <option value="Nike">Nike</option>
                  <option value="Adidas">Adidas</option>
                  <option value="Vans">Vans</option>
                  <option value="Puma">Puma</option>
                  <option value="Reebok">Reebok</option>
                  <option value="New Balance">New Balance</option>
                  <option value="Converse">Converse</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Género</label>
                <select 
                  value={nuevoProducto.sexo}
                  onChange={e => setNuevoProducto({...nuevoProducto, sexo: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6696] focus:ring-2 focus:ring-[#FF6696]/20 rounded-xl px-3 py-2.5 text-xs transition-all outline-hidden text-slate-800"
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Precio ($)</label>
              <input 
                type="number" required placeholder="0.00"
                value={nuevoProducto.precio_menor}
                onChange={e => setNuevoProducto({...nuevoProducto, precio_menor: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6696] focus:ring-2 focus:ring-[#FF6696]/20 rounded-xl px-3 py-2.5 text-xs transition-all outline-hidden text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Colores (Separados por coma)</label>
              <input 
                type="text" placeholder="Negro/Blanco, Rojo/Gris"
                value={nuevoProducto.colores}
                onChange={e => setNuevoProducto({...nuevoProducto, colores: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6696] focus:ring-2 focus:ring-[#FF6696]/20 rounded-xl px-3 py-2.5 text-xs transition-all outline-hidden text-slate-800"
              />
            </div>
            
            {/* 👟 SECCIÓN DE TALLES LIMITADA A MÁXIMO 10 UNIDADES */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">
                Curva de Talles y Unidades en Stock (Máx. 10)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {listaTallesDisponibles.map(t => {
                  // 🛡️ Validación: Verificamos si es un objeto de stock válido, si no, es 0
                  const stockActual = (nuevoProducto.talles && typeof nuevoProducto.talles === 'object' && !Array.isArray(nuevoProducto.talles))
                    ? (nuevoProducto.talles[t] || 0)
                    : 0;

                  const tieneStock = stockActual > 0;

                  // ➕ Función local para sumar 1 unidad (Bloqueada a 10)
                  const sumarPar = () => {
                    if (stockActual >= 10) return; // 🚫 Freno de mano si ya llegó a 10
                    
                    const tallesActuales = (nuevoProducto.talles && typeof nuevoProducto.talles === 'object' && !Array.isArray(nuevoProducto.talles)) 
                      ? { ...nuevoProducto.talles } 
                      : {};
                    
                    setNuevoProducto({
                      ...nuevoProducto,
                      talles: {
                        ...tallesActuales,
                        [t]: stockActual + 1
                      }
                    });
                  };

                  // ➖ Función local para restar 1 unidad
                  const restarPar = () => {
                    if (stockActual === 0) return;
                    const tallesActuales = { ...nuevoProducto.talles };
                    
                    if (stockActual <= 1) {
                      delete tallesActuales[t]; // Lo remueve del objeto si llega a 0
                    } else {
                      tallesActuales[t] = stockActual - 1;
                    }

                    setNuevoProducto({
                      ...nuevoProducto,
                      talles: tallesActuales
                    });
                  };

                  return (
                    <div 
                      key={t}
                      className={`flex flex-col items-center p-1.5 bg-white rounded-xl border transition-all ${
                        tieneStock ? 'border-[#FF6696] shadow-2xs' : 'border-slate-200'
                      }`}
                    >
                      <span className={`text-[11px] font-black mb-1 ${tieneStock ? 'text-[#FF6696]' : 'text-slate-500'}`}>
                        T {t}
                      </span>

                      {/* Selector de cantidad */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5 w-full">
                        <button
                          type="button"
                          onClick={restarPar}
                          disabled={stockActual === 0}
                          className="w-5 h-5 rounded-md flex items-center justify-center bg-white border border-slate-200 text-slate-600 font-bold text-[11px] active:scale-90 disabled:opacity-20 cursor-pointer select-none"
                        >
                          -
                        </button>
                        <span className={`flex-1 text-center font-black text-[11px] ${tieneStock ? 'text-slate-900' : 'text-slate-300'}`}>
                          {tieneStock ? stockActual : "-"}
                        </span>
                        <button
                          type="button"
                          onClick={sumarPar}
                          disabled={stockActual >= 10} // 🚫 Deshabilita visualmente el botón + al llegar a 10
                          className="w-5 h-5 rounded-md flex items-center justify-center bg-slate-900 disabled:bg-slate-300 text-white font-bold text-[11px] active:scale-90 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">Fotos y Videos</label>
              <input
                type="file" multiple accept="image/*,video/*"
                onChange={alCambiarArchivoMúltiple}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#FF6696]/10 file:text-[#FF6696] hover:file:bg-[#FF6696]/20 file:cursor-pointer"
              />
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {previewUrls.map((item, index) => (
                    <div key={index} className="relative h-20 bg-white border border-slate-200 rounded-lg overflow-hidden group">
                      {item.esVideo ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">🎥</div>
                      ) : (
                        <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <button type="button" onClick={() => eliminarFotoDePreview(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button type="submit" className="w-full sm:flex-1 bg-[#FF0A57] hover:bg-[#FF0A57]/90 text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-md font-chewy">
                {nuevoProducto.id ? 'Guardar Cambios' : 'Publicar Producto'}
              </button>
              {nuevoProducto.id && (
                <button type="button" onClick={handleCancelarEdicion} className="w-full sm:w-auto bg-slate-100 text-slate-600 font-bold px-5 py-3.5 rounded-xl text-xs border">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* COLUMNA LISTADO DE STOCK REAL (7 Columnas) */}
        <section className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-[#FF6696] shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 pb-3 border-b border-[#FF6696]/40">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              📦 Listado de Stock ({productos?.length || 0})
            </h2>
            <button
              type="button" onClick={obtenerProductosSupabase}
              className="w-full sm:w-auto justify-center bg-white border-2 border-[#FF6696]/40 text-[#FF6696] hover:bg-[#FF6696] hover:text-white text-[12px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              🔄 Actualizar Tabla
            </button>
          </div>

          {/* Opc. A: VISTA DE TARJETAS PARA CELULARES */}
          <div className="block md:hidden space-y-3">
            {productos?.map(prod => (
              <div key={prod.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={prod.imagen_url} className="w-12 h-12 rounded-lg object-cover bg-white border shrink-0" alt="" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{prod.nombre}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="bg-slate-200 px-1.5 py-0.5 rounded-xs uppercase text-[7px] font-black text-slate-600">{prod.marca}</span>
                        <span className="text-xs font-black text-[#FF0A57]">${prod.precio_menor}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleCargarEdicion(prod)} className="bg-slate-200/80 p-1.5 rounded-lg text-xs">✏️</button>
                    <button onClick={() => handleEliminarProducto(prod.id)} className="bg-rose-100 text-rose-600 p-1.5 rounded-lg text-xs">🗑️</button>
                  </div>
                </div>

                {/* BOTÓN DESPLEGABLE DE STOCK EN MOBILE */}
                <div>
                  <button 
                    onClick={() => setProductoStockAbierto(productoStockAbierto === prod.id ? null : prod.id)}
                    className="w-full bg-slate-900 text-white font-bold text-[11px] py-1.5 rounded-lg uppercase tracking-wide flex justify-center items-center gap-1.5 cursor-pointer"
                  >
                    {productoStockAbierto === prod.id ? '📊 Ocultar Unidades' : '📊 Gestionar Cantidades'}
                  </button>

                  {productoStockAbierto === prod.id && (
                    <div className="mt-2 bg-white border border-slate-200 p-3 rounded-xl space-y-2">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase">Talles cargados:</h5>
                      {prod.stock_variantes && prod.stock_variantes.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {prod.stock_variantes.map(v => (
                            <div key={v.id} className="flex items-center justify-between py-1.5 text-xs">
                              <span className="font-bold text-slate-700">Talle {v.talle}</span>
                              <div className="flex items-center gap-2">
                                <button disabled={cargandoStock} onClick={() => handleModificarCantidadStock(v.id, v.cantidad, 'restar')} className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-md flex items-center justify-center cursor-pointer select-none">-</button>
                                <span className={`font-black w-6 text-center ${v.cantidad === 0 ? 'text-red-500' : 'text-slate-900'}`}>{v.cantidad}</span>
                                <button disabled={cargandoStock} onClick={() => handleModificarCantidadStock(v.id, v.cantidad, 'sumar')} className="w-6 h-6 bg-slate-900 text-white font-bold rounded-md flex items-center justify-center cursor-pointer select-none">+</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No hay variantes cargadas en stock_variantes.</p>
                      )}
                      
                      {/* Agregador rápido de talle por si falta */}
                      <div className="pt-2 border-t border-slate-100 flex gap-1.5">
                        <select 
                          id={`select-talle-mob-${prod.id}`}
                          className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-hidden"
                        >
                          <option value="">Añadir talle...</option>
                          {listaTallesDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button 
                          onClick={() => {
                            const val = document.getElementById(`select-talle-mob-${prod.id}`).value;
                            handleCrearNuevaVarianteTalle(prod.id, val);
                          }}
                          className="bg-[#FF6696] text-white text-xs font-bold px-3 py-1 rounded-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Opc. B: TABLA TRADICIONAL (Desktop) - Integrada con Radix UI */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-black text-[12px]">
                  <th className="py-2.5">Modelo</th>
                  <th className="py-2.5">Marca</th>
                  <th className="py-2.5 text-center">Control Stock Real por Talle</th>
                  <th className="py-2.5">Precio</th>
                  <th className="py-2.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {productos?.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Columna Modelo */}
                    <td className="py-3 flex items-center gap-2.5 max-w-[160px]">
                      <img src={prod.imagen_url} className="w-8 h-8 rounded-md object-cover bg-slate-100 border" alt="" />
                      <span className="truncate font-bold text-slate-900">{prod.nombre}</span>
                    </td>
                    
                    {/* Columna Marca */}
                    <td className="py-3">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-sm uppercase text-[9px] font-bold text-slate-600">{prod.marca}</span>
                    </td>
                    
                    {/* Columna Dropdown de Radix (Acá estaba el problema de la variable) */}
                    <td className="py-3 text-center">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            type="button"
                            className="mx-auto font-black text-[11px] px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 bg-white border border-slate-200 hover:border-[#FF6696] text-slate-700 hover:text-[#FF6696] shadow-2xs cursor-pointer transition-all outline-hidden"
                          >
                            📊 Gestionar
                            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500">
                              {prod.stock_variantes?.reduce((acc, v) => acc + (v.cantidad || 0), 0) || 0} u.
                            </span>
                          </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            sideOffset={5}
                            className="z-50 min-w-[240px] bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xl space-y-2 outline-hidden"
                          >
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100 mb-1">
                              Talles en inventario
                            </div>

                            {prod.stock_variantes && prod.stock_variantes.length > 0 ? (
                              <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-1">
                                {prod.stock_variantes
                                  // 🛠️ FILTRADO: Oculta los talles en 0 para limpiar la visual de Melani
                                  .filter(v => v.cantidad > 0)
                                  // 🛠️ ORDENAMIENTO: Ordena los talles de menor a mayor (ej: T 40, T 43, T 44)
                                  .sort((a, b) => Number(a.talle) - Number(b.talle))
                                  .map(v => (
                                    <div key={v.id} className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                                      <span className="font-extrabold text-[11px] text-slate-700 bg-white border border-slate-200/60 px-2 py-0.5 rounded-md">
                                        T {v.talle}
                                      </span>
                                      
                                      <div className="flex items-center gap-2">
                                        <button 
                                          type="button" disabled={cargandoStock}
                                          onClick={() => handleModificarCantidadStock(v.id, v.cantidad, 'restar')} 
                                          className="w-5 h-5 bg-white hover:bg-slate-200 border border-slate-200 font-black rounded-md flex items-center justify-center cursor-pointer text-xs transition-colors select-none active:scale-95"
                                        >
                                          -
                                        </button>
                                        <span className={`font-black text-xs w-4 text-center ${v.cantidad === 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                                          {v.cantidad}
                                        </span>
                                        <button 
                                          type="button" disabled={cargandoStock}
                                          onClick={() => handleModificarCantidadStock(v.id, v.cantidad, 'sumar')} 
                                          className="w-5 h-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-md flex items-center justify-center cursor-pointer text-xs transition-colors select-none active:scale-95"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  
                                {/* 💡 Un seguro visual: si tenía variantes cargadas pero todas están en 0 */}
                                {prod.stock_variantes.filter(v => v.cantidad > 0).length === 0 && (
                                  <p className="text-[11px] text-slate-400 italic py-1 text-center">Sin talles con stock disponible.</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic py-1 text-center">Sin talles cargados.</p>
                            )}

                            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                              <select 
                                id={`select-talle-radix-${prod.id}`}
                                className="bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold px-2 py-1 flex-1 focus:border-[#FF6696] outline-hidden text-slate-600 cursor-pointer"
                              >
                                <option value="">+ Talle</option>
                                {listaTallesDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <button 
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(`select-talle-radix-${prod.id}`);
                                  handleCrearNuevaVarianteTalle(prod.id, el.value);
                                  el.value = "";
                                }}
                                className="bg-slate-900 hover:bg-[#FF6696] text-white font-black px-2.5 py-1 rounded-lg text-[10px] cursor-pointer transition-colors shadow-2xs"
                              >
                                OK
                              </button>
                            </div>

                            <DropdownMenu.Arrow className="fill-white stroke-slate-200 stroke-1" width={10} height={5} />
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>

                    {/* Columna Precio */}
                    <td className="py-3 text-slate-900 font-bold">
                      ${prod.precio_menor}
                    </td>

                    {/* Columna Acciones */}
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => handleCargarEdicion(prod)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer">✏️</button>
                        <button onClick={() => handleEliminarProducto(prod.id)} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
});

export default AdminPage;