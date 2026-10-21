const activosRepository = require('../repositories/activos.repository');

// Tipos de activos permitidos
const tiposPermitidos = [
    'servidor',
    'switch',
    'router',
    'firewall',
    'computador',
    'pc',
    'impresora',
    'almacenamiento',
    'otro'
];

// Estados permitidos
const estadosPermitidos = [
    'operativo',
    'en_riesgo',
    'fuera_servicio'
];

// Niveles de criticidad
const criticidadesPermitidas = [
    'baja',
    'media',
    'alta'
];

// Crear errores con códigos HTTP
function crearError(mensaje, codigo) {
    const error = new Error(mensaje);
    error.status = codigo;
    return error;
}

// Validar el identificador
function validarId(id) {
    const numero = Number(id);

    if (!Number.isSafeInteger(numero) || numero <= 0) {
        throw crearError('ID de activo inválido', 400);
    }

    return numero;
}

// Validar información del activo
function validarActivo(datos) {

    if (!datos || typeof datos !== 'object' ||
        Array.isArray(datos)) {
        throw crearError('Debe enviar un objeto JSON válido', 400);
    }

    // Campos obligatorios
    const obligatorios = [
        'empresa',
        'nombre',
        'tipo',
        'estado',
        'criticidad'
    ];

    for (const campo of obligatorios) {
        if (typeof datos[campo] !== 'string' ||
            datos[campo].trim() === '') {
            throw crearError(
                `El campo ${campo} es obligatorio`, 400
            );
        }
    }

    // Normalizar información
    const activo = {
        empresa: datos.empresa.trim(),
        nombre: datos.nombre.trim(),
        tipo: datos.tipo.trim().toLowerCase(),
        estado: datos.estado.trim().toLowerCase(),
        criticidad: datos.criticidad.trim().toLowerCase()
    };

    // Validar tipo de activo
    if (!tiposPermitidos.includes(activo.tipo)) {
        throw crearError('Tipo de activo no permitido', 400);
    }

    // Validar estado
    if (!estadosPermitidos.includes(activo.estado)) {
        throw crearError('Estado de activo no permitido', 400);
    }

    // Validar criticidad
    if (!criticidadesPermitidas.includes(activo.criticidad)) {
        throw crearError('Nivel de criticidad no permitido', 400);
    }

    // Campos opcionales
    const opcionales = [
        'marca',
        'modelo',
        'direccion_ip',
        'observaciones'
    ];

    for (const campo of opcionales) {
        if (datos[campo] != null &&
            typeof datos[campo] !== 'string') {
            throw crearError(
                `El campo ${campo} debe ser texto`, 400
            );
        }

        activo[campo] = datos[campo] == null
            ? null
            : datos[campo].trim();
    }

    return activo;
}

// 1. Listar todos los activos
async function listar() {
    return await activosRepository.listar();
}

// 2. Consultar por ID
async function consultarPorId(id) {
    const idValidado = validarId(id);

    const activo = await activosRepository.consultarPorId(
        idValidado
    );

    if (!activo) {
        throw crearError('Activo tecnológico no encontrado', 404);
    }

    return activo;
}

// 3. Crear activo
async function crear(datos) {
    const activoValidado = validarActivo(datos);

    return await activosRepository.crear(activoValidado);
}

// 4. Actualizar activo
async function actualizar(id, datos) {
    const idValidado = validarId(id);
    const activoValidado = validarActivo(datos);

    const existente = await activosRepository.consultarPorId(
        idValidado
    );

    if (!existente) {
        throw crearError('Activo tecnológico no encontrado', 404);
    }

    return await activosRepository.actualizar(
        idValidado,
        activoValidado
    );
}

// 5. Eliminar activo
async function eliminar(id) {
    const idValidado = validarId(id);

    const eliminado = await activosRepository.eliminar(
        idValidado
    );

    if (!eliminado) {
        throw crearError('Activo tecnológico no encontrado', 404);
    }

    return true;
}

module.exports = {
    listar,
    consultarPorId,
    crear,
    actualizar,
    eliminar
};
