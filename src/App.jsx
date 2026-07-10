import { useState, useEffect } from 'react';
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

  // --- TRAER PRODUCTOS DE SUPABASE (PRODUCCIÓN) ---
  const obtenerProductosSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('zapatillas')
        .select('*')
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
      // 🌟 1. LOGICA DE SUBIDA MÚLTIPLE AL STORAGE
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

      // 🌟 Como blindamos el formulario en el Paso 2, listaUrlsFinales[0] es una Foto real garantizada
      const portadaPrincipal = listaUrlsFinales.length > 0 
        ? listaUrlsFinales[0] 
        : (nuevoProducto.imagen_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500');

      // 🌟 2. ARMAR EL OBJETO PARA SUPABASE CON LAS DOS COLUMNAS DE IMÁGENES
      const datosProducto = {
        nombre: nuevoProducto.nombre,
        marca: nuevoProducto.marca,
        sexo: nuevoProducto.sexo,
        precio_menor: parseFloat(nuevoProducto.precio_menor) || 0,
        precio_mayor: parseFloat(nuevoProducto.precio_mayor) || 0,
        imagen_url: portadaPrincipal, // Tu columna clásica (Portada en Grilla)
        imagenes_urls: listaUrlsFinales, // Tu array de galería (Fotos + Videos)
        talles: nuevoProducto.talles && nuevoProducto.talles.length > 0 ? nuevoProducto.talles : [40],
        colores: arrayColores.length > 0 ? arrayColores : ['Multicolor']
      };

      let error;

      if (nuevoProducto.id) {
        const resultado = await supabase
          .from('zapatillas')
          .update(datosProducto)
          .eq('id', nuevoProducto.id);
        error = resultado.error;
      } else {
        const resultado = await supabase
          .from('zapatillas')
          .insert([datosProducto]);
        error = resultado.error;
      }

      if (error) throw error;

      // Alerta de éxito definitiva reemplazando el loading
      Swal.fire({
        icon: 'success',
        title: nuevoProducto.id ? '¡Cambios guardados!' : '¡Sincronizado!',
        text: nuevoProducto.id 
          ? `"${nuevoProducto.nombre}" se actualizó correctamente con sus imágenes.`
          : `"${nuevoProducto.nombre}" ya está publicado con su galería de fotos.`,
        confirmButtonColor: '#FF6696',
        customClass: { popup: 'rounded-2xl' }
      });

      // Actualizamos el estado global
      await obtenerProductosSupabase();

      // 🌟 3. LIMPIEZA TOTAL DEL FORMULARIO Y DE LOS ESTADOS DE PREVIEWS EN EL PANEL
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
        talles: [] 
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
    setNuevoProducto({
      id: producto.id, // Mantenemos el ID para saber que es una edición
      nombre: producto.nombre,
      marca: producto.marca,
      sexo: producto.sexo || 'Unisex',
      precio_menor: producto.precio_menor,
      precio_mayor: producto.precio_mayor,
      imagen_url: producto.imagen_url,
      colores: producto.colores ? producto.colores.join(', ') : '',
      talles: producto.talles || []
    });
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