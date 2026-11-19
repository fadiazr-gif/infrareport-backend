
import './style.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/activos';

let activosActuales = [];
let idEnEdicion = null;

// Interfaz de usuario
document.querySelector('#app').innerHTML = `
  <main class="contenedor">

    <header class="encabezado">
      <h1>InfraReport</h1>
      <p>Sistema de Diagnóstico de Infraestructura Tecnológica</p>
    </header>

    <section class="panel formulario-panel">
      <h2 id="titulo-formulario">Registrar activo tecnológico</h2>
      <p>Administración de infraestructura empresarial</p>

      <form id="form-activo">
        <div class="form-grid">

          <div class="campo">
            <label for="empresa">Empresa *</label>
            <input id="empresa" name="empresa" required>
          </div>

          <div class="campo">
            <label for="nombre">Nombre del activo *</label>
            <input id="nombre" name="nombre" required>
          </div>

          <div class="campo">
            <label for="tipo">Tipo *</label>
            <select id="tipo" name="tipo" required>
              <option value="">Seleccione...</option>
              <option value="servidor">Servidor</option>
              <option value="switch">Switch</option>
              <option value="router">Router</option>
              <option value="firewall">Firewall</option>
              <option value="computador">Computador</option>
              <option value="pc">PC</option>
              <option value="impresora">Impresora</option>
              <option value="almacenamiento">Almacenamiento</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div class="campo">
            <label for="marca">Marca</label>
            <input id="marca" name="marca">
          </div>

          <div class="campo">
            <label for="modelo">Modelo</label>
            <input id="modelo" name="modelo">
          </div>

          <div class="campo">
            <label for="direccion_ip">Dirección IPv4</label>
            <input id="direccion_ip" name="direccion_ip"
              placeholder="192.168.1.10">
          </div>

          <div class="campo">
            <label for="estado_activo">Estado *</label>
            <select id="estado_activo" name="estado" required>
              <option value="">Seleccione...</option>
              <option value="operativo">Operativo</option>
              <option value="en_riesgo">En riesgo</option>
              <option value="fuera_servicio">Fuera de servicio</option>
            </select>
          </div>

          <div class="campo">
            <label for="criticidad">Criticidad *</label>
            <select id="criticidad" name="criticidad" required>
              <option value="">Seleccione...</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <div class="campo campo-completo">
            <label for="observaciones">Observaciones</label>
            <textarea name="observaciones"
              id="observaciones" rows="3"></textarea>
          </div>
        </div>

        <div class="acciones-formulario">
          <button type="submit" id="guardar-activo">
            Guardar activo tecnológico
          </button>

          <button type="button" id="cancelar-edicion"
            class="btn-secondary" hidden>
            Cancelar edición
          </button>
        </div>
      </form>

      <p id="mensaje-formulario" role="status"
         aria-live="polite"></p>
    </section>

    <section class="panel">
      <div class="barra">
        <div>
          <h2>Inventario de activos tecnológicos</h2>
          <p>Consulta de infraestructura empresarial</p>
        </div>

        <button id="actualizar">Actualizar activos</button>
      </div>

      <p id="estado" role="status" aria-live="polite"></p>

      <div class="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Empresa</th>
              <th>Activo</th>
              <th>Tipo</th>
              <th>Marca</th>
              <th>Estado</th>
              <th>Criticidad</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody id="tabla-activos"></tbody>
        </table>
      </div>
    </section>
  </main>
`;

const formulario = document.querySelector('#form-activo');
const tabla = document.querySelector('#tabla-activos');
const estado = document.querySelector('#estado');
const mensaje = document.querySelector('#mensaje-formulario');
const botonGuardar = document.querySelector('#guardar-activo');
const botonCancelar = document.querySelector('#cancelar-edicion');

// Mostrar mensajes al usuario
function mostrarMensaje(texto, tipo = '') {
  mensaje.textContent = texto;
  mensaje.className = tipo;
}

// Procesar respuestas HTTP del servidor
async function procesarRespuesta(respuesta) {
  const resultado = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(
      `HTTP ${respuesta.status}: ` +
      (resultado.error || 'Error del servidor')
    );
  }

  return resultado;
}

// Obtener todos los activos (GET)
async function cargarActivos() {
  estado.textContent = 'Cargando activos tecnológicos...';
  estado.className = '';
  tabla.replaceChildren();

  try {
    const respuesta = await fetch(API_URL);
    const activos = await procesarRespuesta(respuesta);

    if (!Array.isArray(activos)) {
      throw new Error('La API no devolvió un arreglo');
    }

    activosActuales = activos;

    if (activos.length === 0) {
      estado.textContent = 'No existen activos registrados';
      return;
    }

    activos.forEach(activo => {
      const fila = document.createElement('tr');

      const valores = [
        activo.id,
        activo.empresa,
        activo.nombre,
        activo.tipo,
        activo.marca,
        activo.estado,
        activo.criticidad
      ];

      valores.forEach(valor => {
        const celda = document.createElement('td');
        celda.textContent = valor || '—';
        fila.appendChild(celda);
      });

      // Columna de acciones
      const acciones = document.createElement('td');
      const contenedor = document.createElement('div');
      contenedor.className = 'acciones';

      const editar = document.createElement('button');
      editar.textContent = 'Editar';
      editar.className = 'btn-secondary';
      editar.dataset.accion = 'editar';
      editar.dataset.id = activo.id;

      const eliminar = document.createElement('button');
      eliminar.textContent = 'Eliminar';
      eliminar.className = 'btn-danger';
      eliminar.dataset.accion = 'eliminar';
      eliminar.dataset.id = activo.id;

      contenedor.append(editar, eliminar);
      acciones.appendChild(contenedor);
      fila.appendChild(acciones);
      tabla.appendChild(fila);
    });

    estado.textContent =
      `${activos.length} activos tecnológicos registrados`;

  } catch (error) {
    estado.textContent =
      `No se pudieron cargar los activos: ${error.message}`;
    estado.className = 'error';
    activosActuales = [];
  }
}

// Validar IPv4 cuando se proporciona
function validarIP(ip) {
  if (!ip) return true;

  const partes = ip.split('.');

  return partes.length === 4 &&
    partes.every(parte =>
      /^\d{1,3}$/.test(parte) &&
      Number(parte) >= 0 &&
      Number(parte) <= 255
    );
}

// Restablecer formulario
function cancelarEdicion() {
  idEnEdicion = null;
  formulario.reset();

  botonGuardar.textContent = 'Guardar activo tecnológico';
  botonCancelar.hidden = true;

  document.querySelector('#titulo-formulario')
    .textContent = 'Registrar activo tecnológico';
}

// Iniciar edición de un registro
function editarActivo(id) {
  const activo = activosActuales.find(a => a.id === id);

  if (!activo) {
    mostrarMensaje('Activo no encontrado', 'mensaje-error');
    return;
  }

  idEnEdicion = id;

  const campos = [
    'empresa', 'nombre', 'tipo', 'marca', 'modelo',
    'direccion_ip', 'estado', 'criticidad',
    'observaciones'
  ];

  campos.forEach(campo => {
    formulario.elements.namedItem(campo).value =
      activo[campo] ?? '';
  });

  document.querySelector('#titulo-formulario')
    .textContent = `Editar activo tecnológico #${id}`;

  botonGuardar.textContent = 'Actualizar activo';
  botonCancelar.hidden = false;

  mostrarMensaje('Modifica los datos y guarda los cambios');

  formulario.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

// Crear o actualizar activo (POST / PUT)
formulario.addEventListener('submit', async evento => {
  evento.preventDefault();

  const activo = Object.fromEntries(
    new FormData(formulario).entries()
  );

  for (const campo in activo) {
    activo[campo] = activo[campo].trim();
  }

  if (!validarIP(activo.direccion_ip)) {
    mostrarMensaje(
      'La dirección IPv4 ingresada no es válida',
      'mensaje-error'
    );
    return;
  }

  const editando = idEnEdicion !== null;

  const metodo = editando ? 'PUT' : 'POST';
  const url = editando
    ? `${API_URL}/${idEnEdicion}`
    : API_URL;

  botonGuardar.disabled = true;
  botonCancelar.disabled = true;
  mostrarMensaje('Procesando solicitud...');

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activo)
    });

    const resultado = await procesarRespuesta(respuesta);

    if (editando && respuesta.status !== 200) {
      throw new Error('Se esperaba HTTP 200 al actualizar');
    }

    if (!editando && respuesta.status !== 201) {
      throw new Error('Se esperaba HTTP 201 al crear');
    }

    cancelarEdicion();

    mostrarMensaje(
      editando
        ? `Activo ${resultado.id} actualizado correctamente`
        : `Activo ${resultado.id} creado correctamente`,
      'mensaje-exito'
    );

    await cargarActivos();

  } catch (error) {
    mostrarMensaje(error.message, 'mensaje-error');
  } finally {
    botonGuardar.disabled = false;
    botonCancelar.disabled = false;
  }
});

// Eliminar activo (DELETE)
async function eliminarActivo(id) {
  const activo = activosActuales.find(a => a.id === id);

  if (!activo) return;

  const confirmado = window.confirm(
    `¿Deseas eliminar el activo "${activo.nombre}"?`
  );

  if (!confirmado) return;

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!respuesta.ok) {
      await procesarRespuesta(respuesta);
    }

    if (respuesta.status !== 204) {
      throw new Error(
        `Se esperaba HTTP 204, recibido ${respuesta.status}`
      );
    }

    if (idEnEdicion === id) {
      cancelarEdicion();
    }

    mostrarMensaje(
      `Activo ${id} eliminado correctamente`,
      'mensaje-exito'
    );

    await cargarActivos();

  } catch (error) {
    mostrarMensaje(
      `Error al eliminar: ${error.message}`,
      'mensaje-error'
    );
  }
}

// Manejar acciones desde la tabla
tabla.addEventListener('click', async evento => {
  const boton = evento.target.closest('button[data-accion]');

  if (!boton) return;

  const id = Number(boton.dataset.id);

  if (boton.dataset.accion === 'editar') {
    editarActivo(id);
  }

  if (boton.dataset.accion === 'eliminar') {
    boton.disabled = true;
    try {
      await eliminarActivo(id);
    } finally {
      boton.disabled = false;
    }
  }
});

// Otros controles
botonCancelar.addEventListener('click', () => {
  cancelarEdicion();
  mostrarMensaje('');
});

document.querySelector('#actualizar')
  .addEventListener('click', cargarActivos);

// Carga inicial
cargarActivos();
