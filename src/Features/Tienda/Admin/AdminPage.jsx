import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function AdminPage({
  nuevoProducto,
  setNuevoProducto,
  listaTallesDisponibles,
  handleTalleSeleccionado,
  handleSubirImagen,
  handleGuardarProductoMelani,
  handleCerrarSesion,
  productos,                // Pasar la lista completa desde App.jsx
  handleEliminarProducto,   // Nueva función recomendada en App.jsx
  handleCargarEdicion,       // Nueva función recomendada en App.jsx
  obtenerProductosSupabase,
  handleCancelarEdicion
}) {

 // 🌟 ESTADOS NUEVOS: Soportan múltiples imágenes locales antes de subirse
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);


  const alCambiarArchivoMúltiple = (e) => {
    const archivos = Array.from(e.target.files);
    if (archivos.length === 0) return;

    // Guardamos los archivos físicos en el estado para subirlos después
    setArchivosSeleccionados(prev => [...prev, ...archivos]);

    // Generamos las URLs de previsualización para el diseño
    const nuevasPreviews = archivos.map(archivo => ({
      url: URL.createObjectURL(archivo),
      esVideo: archivo.type.includes('video')
    }));

    setPreviewUrls(prev => [...prev, ...nuevasPreviews]);
    
    // 💡 NOTA: Quitamos la subida automática inmediata "handleSubirImagen" 
    // para subir todas juntas cuando se presione "Publicar Producto" o "Guardar Cambios".
  };

  // Función opcional por si la administradora quiere remover una foto de la lista antes de guardar
  const eliminarFotoDePreview = (indexAEliminar) => {
    setArchivosSeleccionados(prev => prev.filter((_, i) => i !== indexAEliminar));
    setPreviewUrls(prev => prev.filter((_, i) => i !== indexAEliminar));
  };


  const alEnviarFormulario = async (e) => {
    e.preventDefault();

    // 🌟 VALIDACIÓN: Verificamos si hay archivos seleccionados nuevos
    if (archivosSeleccionados.length > 0) {
      const primerArchivo = archivosSeleccionados[0];
      const esVideo = primerArchivo.type.includes('video') || 
                      primerArchivo.name.toLowerCase().endsWith('.mp4') || 
                      primerArchivo.name.toLowerCase().endsWith('.mov') || 
                      primerArchivo.name.toLowerCase().endsWith('.webm');

      // Si el primer elemento es un video, frenamos a Melani con un aviso
      if (esVideo) {
        Swal.fire({
          icon: 'warning',
          title: 'Foto de portada requerida',
          text: 'Por favor, selecciona una foto como primer archivo para que actúe como portada en la tienda, y luego incluye los videos que quieras.',
          confirmButtonColor: '#FF6696',
          customClass: { popup: 'rounded-2xl' }
        });
        return; // Bloquea el envío
      }
    }

    // Si todo está ok (o si no se cambiaron fotos al editar), ejecutamos el guardado definitivo
    // Pasamos los estados locales y sus modificadores para que la función limpie todo al terminar con éxito
    await handleGuardarProductoMelani(
      e, 
      archivosSeleccionados, 
      setArchivosSeleccionados, 
      setPreviewUrls
    );
  };


  return (
    <div className="min-h-screen bg-[#FFE8EE] text-slate-800 font-sans pr-4 pl-4 pt-2 pb-8 md:pt-2 md:pr-4 md:pl-4 md:pb-8">
      
      {/* HEADER DE GESTIÓN */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-[#FF6696] shadow-2xs gap-4 mb-8">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            ⚙️ Panel de Control Principal
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Bienvenido al espacio de administración de Prisma Import.</p>
        </div>
        <button 
          onClick={handleCerrarSesion}
          className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
        >
          Cerrar Sesión 🔓
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA FORMULARIO DE CARGA / EDICIÓN (5 Columnas) */}
        <section className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#FF6696] shadow-2xs h-fit">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-5 pb-3 border-b border-[#FF6696]/40">
            {nuevoProducto.id ? "📝 Editar Producto" : "👟 Cargar Nuevo Modelo"}
          </h2>

          <form onSubmit={alEnviarFormulario} className="space-y-6">
            
            {/* Input Nombre */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nombre del Modelo</label>
              <input 
                type="text" required placeholder="Ej: Air Max Infinity"
                value={nuevoProducto.nombre}
                onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                className="w-full bg-slate-50 border border-[#FF6696]/40 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#FF6696]"
              />
            </div>

            {/* Fila Marca e Importe */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Marca</label>
                <select 
                  value={nuevoProducto.marca}
                  onChange={e => setNuevoProducto({...nuevoProducto, marca: e.target.value})}
                  className="w-full bg-slate-50 border border-[#FF6696]/40 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#FF6696] text-slate-800"
                >
                  <option value="">Seleccionar</option>
                  <option value="Nike">Nike</option>
                  <option value="Adidas">Adidas</option>
                  <option value="Vans">Vans</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Género</label>
                <select 
                  value={nuevoProducto.sexo}
                  onChange={e => setNuevoProducto({...nuevoProducto, sexo: e.target.value})}
                  className="w-full bg-slate-50 border border-[#FF6696]/40 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#FF6696] text-slate-800"
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                </select>
              </div>
            </div>

            {/* Precios */}
            <div className="grid grid-cols gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Precio ($)</label>
                <input 
                  type="number" required placeholder="0.00"
                  value={nuevoProducto.precio_menor}
                  onChange={e => setNuevoProducto({...nuevoProducto, precio_menor: e.target.value})}
                  className="w-full bg-slate-50 border border-[#FF6696]/40 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#FF6696]"
                />
              </div>
            </div>

            {/* Colores */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Colores (Separados por coma)</label>
              <input 
                type="text" placeholder="Negro/Blanco, Rojo/Gris"
                value={nuevoProducto.colores}
                onChange={e => setNuevoProducto({...nuevoProducto, colores: e.target.value})}
                className="w-full bg-slate-50 border border-[#FF6696]/40 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#FF6696]"
              />
            </div>

            {/* SELECCIÓN DE TALLES COMPACTO */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Curva de Talles en Stock</label>
              <div className="flex flex-wrap gap-1.5">
                {listaTallesDisponibles.map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => handleTalleSeleccionado(t)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      nuevoProducto.talles.includes(t)
                        ? 'bg-[#FF6696] text-white border-[#FF6696]'
                        : 'bg-slate-50 text-slate-500 border-[#FF6696]/40 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* SUBIDA DE MULTIMEDIA MULTIPLE CON PREVISUALIZACIÓN */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Fotos y Videos del Producto
              </label>
              
              {/* Botón de carga nativo conectado a tu función alCambiarArchivoMúltiple */}
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={alCambiarArchivoMúltiple}
                className="block w-full text-xs text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-xs file:font-bold
                  file:bg-[#FF6696]/10 file:text-[#FF6696]
                  hover:file:bg-[#FF6696]/20 file:cursor-pointer"
              />

              {/* 💡 Texto explicativo clave para guiar a Melani */}
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                <span className="text-[#FF0A57] font-bold">⚠️ Regla importante:</span> El <span className="font-bold underline">primer archivo</span> de la lista debe ser obligatoriamente una <span className="font-bold">Foto</span> (será la portada en la tienda). Podés incluir videos en la misma selección, pero siempre colocalos después de la foto principal.
              </p>

              {/* Contenedor de Previews usando tus estados reales */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {previewUrls.map((item, index) => (
                    <div key={index} className="relative h-20 bg-white border border-slate-200 rounded-lg overflow-hidden group">
                      {item.esVideo ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/70" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        </div>
                      ) : (
                        <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                      )}

                      {/* Botón flotante para eliminar la foto/video antes de guardar */}
                      <button
                        type="button"
                        onClick={() => eliminarFotoDePreview(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Etiqueta flotante para marcar cuál es la portada principal */}
                      {index === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-[#FF0A57] text-[8px] text-white font-black text-center py-0.5 uppercase tracking-wide">
                          Portada
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {/* Botón Principal de Guardar (Ocupa todo el espacio si está solo, o se comparte si hay cancelación) */}
              <button
                type="submit"
                className="flex-1 bg-[#FF0A57] hover:bg-[#FF0A57]/90 text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all cursor-pointer shadow-md text-center"
              >
                {nuevoProducto.id ? 'Guardar Cambios' : 'Publicar Producto'}
              </button>

              {/* ⚡ BOTÓN CANCELAR: Solo se renderiza si nuevoProducto.id existe */}
              {nuevoProducto.id && (
                <button
                  type="button" // 👈 Obligatorio para que no actúe como "Enviar"
                  onClick={(e) => handleCancelarEdicion(e)} // 👈 Pasamos el evento explícitamente
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all cursor-pointer border border-slate-200"
                >
                  Cancelar edicion
                </button>
              )}
            </div>
          </form>
        </section>

        {/* COLUMNA LISTADO DE STOCK REAL (7 Columnas) */}
        <section className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#FF6696] shadow-2xs">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#FF6696]/40">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              📦 Listado de Stock Real ({productos?.length || 0})
            </h2>

            {/* BOTÓN DE ACTUALIZAR OPTIMIZADO */}
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                console.log("Actualizando stock...");
                try {
                  // Forzamos la consulta asíncrona de forma segura
                  await obtenerProductosSupabase();
                  console.log("¡Stock actualizado con éxito!");
                } catch (err) {
                  console.error("Error en el refresco manual:", err);
                }
              }}
              className="bg-white border-2 border-[#FF6696]/40 hover:bg-[#FF6696] hover:text-white text-[#FF6696] text-[12px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
            >
              🔄 Actualizar Tabla
            </button>
          </div>

          {/* TABLA DE STOCK INTEGRADA */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-black text-[8px] md:text-[12px]">
                  <th className="py-2.5">Modelo</th>
                  <th className="py-2.5">Marca</th>
                  <th className="py-2.5">Talles</th>
                  <th className="py-2.5">Precios</th>
                  <th className="py-2.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {productos?.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 flex items-center gap-2.5 max-w-[160px]">
                      <img src={prod.imagen_url} className="w-8 h-8 rounded-md object-cover bg-slate-100 border" alt="" />
                      <span className="truncate font-bold text-slate-900">{prod.nombre}</span>
                    </td>
                    <td className="py-3"><span className="bg-slate-100 px-2 py-0.5 rounded-sm uppercase text-[9px] font-bold text-slate-600">{prod.marca}</span></td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-0.5 max-w-[120px]">
                        {prod.talles?.map(t => (
                          <span key={t} className="bg-slate-50 border border-slate-100 px-1 rounded-xs text-[9px] text-slate-500">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-slate-900">
                      <span className="block font-bold">${prod.precio_menor}</span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => handleCargarEdicion(prod)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleEliminarProducto(prod.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          🗑️
                        </button>
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
}