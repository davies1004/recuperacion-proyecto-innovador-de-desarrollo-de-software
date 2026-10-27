
/* =====================================
   ECORECICLA - FUNCIONES PRINCIPALES
===================================== */

const formulario = document.getElementById("formulario-reciclaje");
const campoNombre = document.getElementById("nombre");
const campoCategoria = document.getElementById("categoria");
const campoCantidad = document.getElementById("cantidad");
const mensaje = document.getElementById("mensaje");
const totalRegistros = document.getElementById("total-registros");
const listaRegistros = document.getElementById("lista-registros");
const botonLimpiar = document.getElementById("limpiar-registros");

const CLAVE_REGISTROS = "ecorecicla_registros";

let registros = cargarRegistros();

function cargarRegistros() {
  try {
    const datos = localStorage.getItem(CLAVE_REGISTROS);
    const resultado = datos ? JSON.parse(datos) : [];

    if (!Array.isArray(resultado)) {
      return [];
    }

    return resultado.filter((registro) =>
      registro &&
      typeof registro.id === "string" &&
      typeof registro.nombre === "string" &&
      typeof registro.categoria === "string" &&
      Number.isInteger(registro.cantidad) &&
      registro.cantidad >= 1 &&
      registro.cantidad <= 10000
    );
  } catch (error) {
    console.error("No se pudieron cargar los registros:", error);
    return [];
  }
}

function guardarRegistros() {
  try {
    localStorage.setItem(CLAVE_REGISTROS, JSON.stringify(registros));
    return true;
  } catch (error) {
    console.error("No se pudieron guardar los registros:", error);
    mostrarMensaje(
      "No se pudieron guardar los datos. Revisa el almacenamiento del navegador.",
      "error"
    );
    return false;
  }
}

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = "mensaje";

  if (tipo) {
    mensaje.classList.add(tipo);
  }
}

function crearElemento(tag, clase, texto) {
  const elemento = document.createElement(tag);
  elemento.className = clase;
  elemento.textContent = texto;
  return elemento;
}

function mostrarRegistros() {
  listaRegistros.replaceChildren();
  totalRegistros.textContent = registros.length;

  if (registros.length === 0) {
    listaRegistros.appendChild(
      crearElemento("p", "vacio", "Todavía no has registrado materiales.")
    );
    return;
  }

  registros.forEach((registro) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "registro-item";

    const informacion = document.createElement("div");
    informacion.appendChild(
      crearElemento("h3", "", registro.nombre)
    );
    informacion.appendChild(
      crearElemento("p", "", "Categoría: " + registro.categoria)
    );
    informacion.appendChild(
      crearElemento("p", "", "Cantidad: " + registro.cantidad + " unidades")
    );

    const botonEliminar = crearElemento(
      "button",
      "boton-eliminar",
      "Eliminar"
    );

    botonEliminar.type = "button";
    botonEliminar.setAttribute(
      "aria-label",
      "Eliminar registro de " + registro.nombre
    );

    botonEliminar.addEventListener("click", () => {
      registros = registros.filter((item) => item.id !== registro.id);

      if (guardarRegistros()) {
        mostrarRegistros();
        mostrarMensaje("El registro se eliminó correctamente.", "exito");
      }
    });

    tarjeta.append(informacion, botonEliminar);
    listaRegistros.appendChild(tarjeta);
  });
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nombre = campoNombre.value.trim();
  const categoria = campoCategoria.value;
  const cantidadTexto = campoCantidad.value;

  const error = validarRegistro(nombre, categoria, cantidadTexto);

  if (error) {
    mostrarMensaje(error, "error");
    return;
  }

  const nuevoRegistro = {
    id: Date.now().toString() + "-" + Math.random().toString(36).slice(2),
    nombre,
    categoria,
    cantidad: Number(cantidadTexto)
  };

  registros.push(nuevoRegistro);

  if (!guardarRegistros()) {
    registros.pop();
    return;
  }

  formulario.reset();
  mostrarRegistros();
  mostrarMensaje("¡Material registrado correctamente!", "exito");
});

botonLimpiar.addEventListener("click", () => {
  if (registros.length === 0) {
    mostrarMensaje("No hay registros para eliminar.", "error");
    return;
  }

  const confirmar = window.confirm(
    "¿Estás seguro de que deseas eliminar todos los registros?"
  );

  if (!confirmar) {
    return;
  }

  const registrosAnteriores = registros;
  registros = [];

  if (!guardarRegistros()) {
    registros = registrosAnteriores;
    return;
  }

  mostrarRegistros();
  mostrarMensaje("Se eliminaron todos los registros.", "exito");
});

mostrarRegistros();
