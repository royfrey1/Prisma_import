import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './Datos/supabaseClient';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import AdminPage from './Features/Tienda/Admin/AdminPage';
import TiendaPage from './Features/Tienda/Tienda/TiendaPage';
import CarritoModal from './Features/Tienda/Tienda/CarritoModal';
import LoginModal from './Features/Tienda/Admin/LoginModal';
import Swal from 'sweetalert2';

export default function TiendaZapatillasCompleta() {
  // --- CONTROL DE AUTENTICACIÓN REAL ---
  const [sesion, setSesion] = useState(null); // Guarda el usuario logueado (Melani o Yonatan)
  const [mostrarLogin, setMostrarLogin] = useState(false); // Controla si el modal de login está abierto

  // --- ESTADOS DE PRODUCTOS Y CARRITO ---
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]); // Reservado para filtros avanzados
  const [carrito, setCarrito] = useState([]);
  const [tipoVenta, setTipoVenta] = useState('menor');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [cargando, setCargando] = useState(false);

  // --- ESTADOS DE FILTROS ---
  const [busqueda, setBusqueda] = useState('');

  // Estado para filtrar por marca, talle y sexo
  const formularioRef = React.useRef(null);

  // --- ESTADO FORMULARIO DE CARGA (PANEL DE MELANI) ---
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    marca: '',
    sexo: 'Unisex',
    precio_menor: '',
    precio_mayor: '',
    imagen_url: '',
    colores: '', // Se ingresan separados por comas
    talles: {}   // Array dinámico de talles seleccionados
  });

  // Talles disponibles que Melani podrá tildar en su panel
  const listaTallesDisponibles = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44];

  // --- TRAER PRODUCTOS DE SUPABASE (PRODUCCIÓN) ---
  const obtenerProductosSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('zapatillas')
        .select('*, stock_variantes(*)') // Trae también la relación de stock_variantes
        .order('id', { ascending: false }); // Trae los últimos cargados primero

      if (error) throw error;
      
      setProductos(data || []);
      setProductosFiltrados(data || []);
    } catch (error) {
      console.error("Error al traer productos:", error.message);
      alert("No se pudo cargar el catálogo real. Revisá la consola.");
    }
  };

  // Monitorear automáticamente si hay un administrador conectado
  useEffect(() => {
    // 1. Revisar sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
    });

    // 2. Escuchar cambios (Login / Logout) en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    obtenerProductosSupabase();
  }, []);

  // Función para que inicien sesión (Recibe los datos directo desde el LoginModal)
    const handleLoginAdministrador = async (emailInput, passwordInput) => {
      setCargando(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailInput,
          password: passwordInput,
        });

        if (error) throw error;

        // Alerta de bienvenida estilizada con SweetAlert2
        Swal.fire({
          icon: 'success',
          title: '¡Ingreso Exitoso!',
          text: 'Bienvenido al panel de control de Prisma Import.',
          confirmButtonColor: '#FF0A57', // Mantenemos tu color identificatorio
          customClass: {
            popup: 'rounded-2xl',
            title: 'text-sm font-black text-slate-900 uppercase tracking-tight',
            htmlContainer: 'text-xs text-slate-500'
          }
        });

        setMostrarLogin(false); // Cerrar ventana de login
      } catch (error) {
        console.error("Error en login:", error.message);
        
        // Alerta de error estilizada
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'Las credenciales ingresadas son incorrectas. Por favor, verificalas e intentalo de nuevo.',
          confirmButtonColor: '#64748b', // Gris slate para balancear el error
          customClass: {
            popup: 'rounded-2xl',
            title: 'text-sm font-black text-rose-600 uppercase tracking-tight',
            htmlContainer: 'text-xs text-slate-500'
          }
        });
      } finally {
        setCargando(false);
      }
    };

  // Función para cerrar sesión
  const handleCerrarSesion = async () => {
    Swal.fire({
      title: '¿Estás seguro que quieres salir del panel de carga?',
      text: "Tendrás que iniciar sesión nuevamente para modificar el stock.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e', // Rosa/Rojo oscuro
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Seguir editando',
      customClass: { popup: 'rounded-2xl' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        await supabase.auth.signOut();
        
        Swal.fire({
          title: 'Sesión cerrada',
          text: 'Saliste correctamente del panel.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-2xl' }
        });
      }
    });
  };

  // --- LÓGICA DEL CARRITO (CORREGIDA) ---
  const agregarAlCarrito = (producto) => {
    const precioActual = tipoVenta === 'menor' ? producto.precio_menor : producto.precio_mayor;
    
    // 1. Buscamos si ya existe el mismo modelo con el MISMO TALLE y MISMO COLOR
    const existe = carrito.find(item => 
      item.id === producto.id && 
      item.talleElegido === producto.talleElegido &&
      item.colorElegido === producto.colorElegido
    );
    
    if (existe) {
      // 🛠️ Sumamos la cantidad elegida que viene del modal, no un +1 fijo
      setCarrito(carrito.map(item => 
        item.id === producto.id && 
        item.talleElegido === producto.talleElegido &&
        item.colorElegido === producto.colorElegido
          ? { ...item, cantidad: item.cantidad + (producto.cantidadElegida || 1) } 
          : item
      ));
    } else {
      // 🛠️ Respetamos la cantidad elegida inicial del modal en lugar de clavar un 1
      setCarrito([
        ...carrito, 
        { 
          ...producto, 
          cantidad: producto.cantidadElegida || 1, 
          precioUnitario: precioActual 
        }
      ]);
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

    // --- FUNCIÓN PARA SUBIR IMÁGENES A SUPABASE STORAGE ---
    const handleSubirImagen = async (archivo) => {
    if (!archivo) return null;
    
    try {
      // Creamos un nombre único para evitar que se pisen archivos
      const nombreArchivo = `${Date.now()}_${archivo.name.replace(/\s+/g, '_')}`;
      
      // Subimos el archivo físico al bucket 'imagenes-zapatillas'
      const { error } = await supabase.storage
        .from('imagenes-zapatillas')
        .upload(nombreArchivo, archivo);

      if (error) throw error;

      // Obtenemos la URL pública que generó Supabase
      const { data: urlData } = supabase.storage
        .from('imagenes-zapatillas')
        .getPublicUrl(nombreArchivo);

      // 🌟 CLAVE: Retornamos la URL para que el bucle de guardado la acumule
      return urlData.publicUrl;
      
    } catch (error) {
      console.error("Error subiendo imagen:", error.message);
      // Devolvemos null si falla una imagen individual para que no trabe por completo la carga del resto
      return null; 
    }
  };

  const handleGuardarProductoMelani = async (e, archivos = [], setArchivosState, setPreviewsState) => {
    e.preventDefault();

    // 🌟 Mostrar un cartel de "Cargando..." adaptado a archivos multimedia
    Swal.fire({
      title: 'Procesando producto...',
      text: archivos.length > 0 ? `Subiendo ${archivos.length} archivos a Supabase, por favor espere.` : 'Guardando datos...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: { popup: 'rounded-2xl' }
    });
    
    // Blindaje para procesar colores
    let arrayColores = [];
    if (typeof nuevoProducto.colores === 'string') {
      arrayColores = nuevoProducto.colores.split(',').map(c => c.trim()).filter(c => c !== '');
    } else if (Array.isArray(nuevoProducto.colores)) {
      arrayColores = nuevoProducto.colores;
    }

    try {
      // 🌟 1. LÓGICA DE SUBIDA MÚLTIPLE AL STORAGE
      let listaUrlsFinales = [];

      // Si estamos editando, preservamos los archivos que ya tenía guardados de antes
      if (nuevoProducto.id && nuevoProducto.imagenes_urls) {
        listaUrlsFinales = Array.isArray(nuevoProducto.imagenes_urls)
          ? [...nuevoProducto.imagenes_urls]
          : String(nuevoProducto.imagenes_urls).split(',').map(u => u.trim());
      }

      // Si la administradora seleccionó archivos nuevos en esta vuelta, los subimos uno a uno
      if (archivos.length > 0) {
        const urlsSubidas = [];
        for (const archivo of archivos) {
          const urlPublica = await handleSubirImagen(archivo);
          if (urlPublica) {
            urlsSubidas.push(urlPublica);
          }
        }
        
        if (nuevoProducto.id) {
          listaUrlsFinales = [...listaUrlsFinales, ...urlsSubidas];
        } else {
          listaUrlsFinales = urlsSubidas;
        }
      }

      // 🌟 Como blindamos el formulario, listaUrlsFinales[0] es una Foto real garantizada
      const portadaPrincipal = listaUrlsFinales.length > 0 
        ? listaUrlsFinales[0] 
        : (nuevoProducto.imagen_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500');

      // 🛠️ MIGRACIÓN DE MÉTODO: Extraer las llaves si 'talles' viene como objeto de cantidades
      const esObjetoStock = nuevoProducto.talles && typeof nuevoProducto.talles === 'object' && !Array.isArray(nuevoProducto.talles);
      
      // Creamos el array de números para la columna 'talles' de la tabla 'zapatillas'
      const tallesAsignados = esObjetoStock 
        ? Object.keys(nuevoProducto.talles).map(Number)
        : (nuevoProducto.talles && nuevoProducto.talles.length > 0 ? nuevoProducto.talles : [40]);

      // 🌟 2. ARMAR EL OBJETO PARA SUPABASE CON LAS DOS COLUMNAS DE IMÁGENES
      const datosProducto = {
        nombre: nuevoProducto.nombre,
        marca: nuevoProducto.marca,
        sexo: nuevoProducto.sexo,
        precio_menor: parseFloat(nuevoProducto.precio_menor) || 0,
        precio_mayor: parseFloat(nuevoProducto.precio_mayor) || 0,
        imagen_url: portadaPrincipal, // Tu columna clásica (Portada en Grilla)
        imagenes_urls: listaUrlsFinales, // Tu array de galería (Fotos + Videos)
        talles: tallesAsignados, // Tu array de texto viejo conservado
        colores: arrayColores.length > 0 ? arrayColores : ['Multicolor']
      };

      if (nuevoProducto.id) {
        // 📝 CASO EDICIÓN: Actualizamos la zapatilla principal
        const { error: errorUpdate } = await supabase
          .from('zapatillas')
          .update(datosProducto)
          .eq('id', nuevoProducto.id);
          
        if (errorUpdate) throw errorUpdate;

        // 🔄 SINCRONIZACIÓN DE STOCK EN TIEMPO REAL AL EDITAR:
        if (esObjetoStock) {
          for (const [talleStr, cantidad] of Object.entries(nuevoProducto.talles)) {
            const talleNum = Number(talleStr);

            // Intentamos hacer un update por si el talle ya existía asignado al producto
            const { data: updateData, error: errUpVariant } = await supabase
              .from('stock_variantes')
              .update({ cantidad: cantidad })
              .eq('producto_id', nuevoProducto.id)
              .eq('talle', talleNum)
              .select();

            if (errUpVariant) throw errUpVariant;

            // Si updateData está vacío, significa que el talle no existía para este ID en la base de datos.
            // Lo insertamos de cero con el stock asignado en el formulario.
            if (!updateData || updateData.length === 0) {
              const { error: errInVariant } = await supabase
                .from('stock_variantes')
                .insert([{ producto_id: nuevoProducto.id, talle: talleNum, cantidad: cantidad }]);
                
              if (errInVariant) throw errInVariant;
            }
          }
        }

      } else {
        // 👟 CASO NUEVO: Insertamos la zapatilla agregando el .select() para capturar su ID autogenerado
        const { data: productoCreado, error: errorInsert } = await supabase
          .from('zapatillas')
          .insert([datosProducto])
          .select(); // 👈 Clave para recuperar el registro completo con su ID real

        if (errorInsert) throw errorInsert;

        // 🌟 AUTOMATIZACIÓN DE STOCK REAL: Insertamos masivamente en 'stock_variantes'
        if (productoCreado && productoCreado.length > 0) {
          const idZapatillaNueva = productoCreado[0].id;

          let filasStockInicial = [];

          if (esObjetoStock) {
            // Mapeamos el objeto { "38": 3, "39": 1 } a filas individuales con su stock real
            filasStockInicial = Object.entries(nuevoProducto.talles).map(([talle, cantidad]) => ({
              producto_id: idZapatillaNueva,
              talle: Number(talle),
              cantidad: cantidad
            }));
          } else {
            // Fallback por si viniese un array viejo por alguna razón
            filasStockInicial = tallesAsignados.map(talle => ({
              producto_id: idZapatillaNueva,
              talle: talle,
              cantidad: 1 
            }));
          }

          if (filasStockInicial.length > 0) {
            const { error: errorStock } = await supabase
              .from('stock_variantes')
              .insert(filasStockInicial);

            if (errorStock) {
              console.error("Aviso: Se creó el producto pero falló la inicialización de talles:", errorStock.message);
            }
          }
        }
      }

      // Alerta de éxito definitiva reemplazando el loading
      Swal.fire({
        icon: 'success',
        title: nuevoProducto.id ? '¡Cambios guardados!' : '¡Sincronizado!',
        text: nuevoProducto.id 
          ? `"${nuevoProducto.nombre}" se actualizó correctamente con sus imágenes.`
          : `"${nuevoProducto.nombre}" ya está publicado y sus cantidades se guardaron en el stock real.`,
        confirmButtonColor: '#FF6696',
        customClass: { popup: 'rounded-2xl' }
      });

      // Actualizamos el estado global
      await obtenerProductosSupabase();

      // 🌟 3. LIMPIEZA TOTAL DEL FORMULARIO E INICIALIZACIÓN DE TALLES COMO OBJETO VACÍO
      setNuevoProducto({ 
        id: null, 
        nombre: '', 
        marca: '', 
        sexo: 'Unisex', 
        precio_menor: '', 
        precio_mayor: '', 
        imagen_url: '', 
        imagenes_urls: [], 
        colores: '', 
        talles: {} // 👈 Cambiado a objeto vacío para esperar el nuevo esquema de cantidades
      });

      // Reseteamos los estados del formulario usando los callbacks que enviamos del Paso 2
      if (setArchivosState) setArchivosState([]);
      if (setPreviewsState) setPreviewsState([]);

      setTimeout(async () => {
        await obtenerProductosSupabase();
      }, 100);

    } catch (error) {
      console.error("Error al procesar en Supabase:", error.message);
      Swal.fire({
        icon: 'error',
        title: 'Hubo un problema',
        text: 'No se pudo guardar el producto. Verificá la consola o las imágenes.',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // --- FUNCIÓN PARA BORRAR PRODUCTOS DESDE EL PANEL ---
  const handleEliminarProducto = async (id) => {
    // Cambiamos el confirm() viejo por el modal de SweetAlert2
    Swal.fire({
      title: '¿Seguro querés eliminar este producto?',
      text: "Esta acción no se puede deshacer de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF0A57', 
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl',
        title: 'text-sm font-black text-slate-900 uppercase',
        htmlContainer: 'text-xs text-slate-500'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase.from('zapatillas').delete().eq('id', id);
          if (error) throw error;
          
          // Alerta de éxito integrada
          Swal.fire({
            title: '¡Eliminado!',
            text: 'Producto removido del stock correctamente.',
            icon: 'success',
            confirmButtonColor: '#94a3b8',
            customClass: { popup: 'rounded-2xl' }
          });

          await obtenerProductosSupabase();
        } catch (error) {
          Swal.fire('Error', error.message, 'error');
        }
      }
    });
  };

  // --- FUNCIÓN PARA PRECARGAR LOS DATOS EN EL FORMULARIO DE CARGA ---
  const handleCargarEdicion = (producto) => {
   let tallesFormateados = {};
   
   // 👟 Buscamos si el producto ya viene con sus variantes de stock real acopladas
   if (producto.stock_variantes && Array.isArray(producto.stock_variantes)) {
     // Si tu consulta de Supabase ya trae la relación, usamos la cantidad exacta de la base de datos
     producto.stock_variantes.forEach(v => {
       if (v.cantidad > 0) {
         tallesFormateados[v.talle] = v.cantidad;
       }
     });
   } else if (Array.isArray(producto.talles)) {
     // Fallback: Si no tiene la relación acoplada todavía en el objeto local, 
     // podemos intentar buscar las variantes vigentes dentro de su estructura o dejar el 1 temporal.
     producto.talles.forEach(talle => {
       tallesFormateados[talle] = 1; 
     });
   } else if (producto.talles && typeof producto.talles === 'object') {
     tallesFormateados = { ...producto.talles };
   }

   setNuevoProducto({
     id: producto.id,
     nombre: producto.nombre,
     marca: producto.marca,
     sexo: producto.sexo || 'Unisex',
     precio_menor: producto.precio_menor,
     precio_mayor: producto.precio_mayor,
     imagen_url: producto.imagen_url,
     colores: producto.colores ? producto.colores.join(', ') : '',
     talles: tallesFormateados // 👈 Ahora carga con las cantidades de stock reales
   });

   setTimeout(() => {
     formularioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
   }, 100);
  };

  const handleCancelarEdicion = (e) => {
      // 1. Evitamos que el formulario intente procesar o validar campos al cancelar
      if (e) e.preventDefault(); e.stopPropagation();

      // 2. Limpiamos el estado asegurando los campos idénticos a tu carga inicial
      setNuevoProducto({
        id: null, 
        nombre: '',
        marca: '',
        sexo: 'Unisex',
        precio_menor: '',
        precio_mayor: '', 
        imagen_url: '',
        colores: '',
        talles: []
      });

      // Alerta rápida flotante opcional
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Edición cancelada',
        showConfirmButton: false,
        timer: 1500
      });

  };

  return (
    <div className="min-h-screen bg-[#FFE8EE] text-slate-800 font-sans antialiased">
      {sesion ? (
        <AdminPage 
          ref={formularioRef}
          nuevoProducto={nuevoProducto}
          setNuevoProducto={setNuevoProducto}
          listaTallesDisponibles={listaTallesDisponibles}
          handleTalleSeleccionado={handleTalleSeleccionado}
          handleSubirImagen={handleSubirImagen}
          handleGuardarProductoMelani={handleGuardarProductoMelani}
          handleCerrarSesion={handleCerrarSesion}
          productos={productos} // Pasás el stock real
          handleEliminarProducto={handleEliminarProducto} // Pasás la función de borrado
          handleCargarEdicion={handleCargarEdicion}
          obtenerProductosSupabase={obtenerProductosSupabase}
          handleCancelarEdicion={handleCancelarEdicion}
        />
      ) : (
        <>
          <Navbar
            sesion={sesion}
            setMostrarLogin={setMostrarLogin}
            setMostrarCarrito={setMostrarCarrito}
            carrito={carrito}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
          />

          <TiendaPage 
            productos={productos}
            carrito={carrito}
            agregarAlCarrito={agregarAlCarrito}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            tipoVenta={tipoVenta}
            setMostrarCarrito={setMostrarCarrito}
          />

          {/* MODAL DE INICIO DE SESIÓN PARA MELANI & YONATAN */}
          <LoginModal 
            mostrarLogin={mostrarLogin}
            setMostrarLogin={setMostrarLogin}
            handleLoginAdministrador={handleLoginAdministrador}
            cargando={cargando}
          />

          {/* MODAL DEL CARRITO DE COMPRAS */}
          <CarritoModal 
            mostrarCarrito={mostrarCarrito}
            setMostrarCarrito={setMostrarCarrito}
            carrito={carrito}
            setCarrito={setCarrito}
            tipoVenta={tipoVenta}
          />

          <Footer />
        </>
      )}
    </div>
  );
}