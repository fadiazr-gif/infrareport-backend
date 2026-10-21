
const { db } = require('../db/database');

// Obtener varios registros
function consultarTodos(sql, parametros = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, parametros, (error, registros) => {
            if (error) {
                reject(error);
            } else {
                resolve(registros);
            }
        });
    });
}

// Obtener un registro
function consultarUno(sql, parametros = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, parametros, (error, registro) => {
            if (error) {
                reject(error);
            } else {
                resolve(registro);
            }
        });
    });
}

// Ejecutar INSERT, UPDATE o DELETE
function ejecutar(sql, parametros = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, parametros, function(error) {
            if (error) {
                reject(error);
            } else {
                resolve({
                    id: this.lastID,
                    cambios: this.changes
                });
            }
        });
    });
}

// 1. Listar todos los activos
function listar() {
    return consultarTodos(
        'SELECT * FROM activos ORDER BY id DESC'
    );
}

// 2. Consultar un activo por ID
function consultarPorId(id) {
    return consultarUno(
        'SELECT * FROM activos WHERE id = ?',
        [id]
    );
}

// 3. Crear un activo tecnológico
async function crear(activo) {
    const sql = `
        INSERT INTO activos (
            empresa,
            nombre,
            tipo,
            marca,
            modelo,
            direccion_ip,
            estado,
            criticidad,
            observaciones
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const resultado = await ejecutar(sql, [
        activo.empresa,
        activo.nombre,
        activo.tipo,
        activo.marca,
        activo.modelo,
        activo.direccion_ip,
        activo.estado,
        activo.criticidad,
        activo.observaciones
    ]);

    return consultarPorId(resultado.id);
}

// 4. Actualizar un activo
async function actualizar(id, activo) {
    const sql = `
        UPDATE activos SET
            empresa = ?,
            nombre = ?,
            tipo = ?,
            marca = ?,
            modelo = ?,
            direccion_ip = ?,
            estado = ?,
            criticidad = ?,
            observaciones = ?
        WHERE id = ?
    `;

    const resultado = await ejecutar(sql, [
        activo.empresa,
        activo.nombre,
        activo.tipo,
        activo.marca,
        activo.modelo,
        activo.direccion_ip,
        activo.estado,
        activo.criticidad,
        activo.observaciones,
        id
    ]);

    if (resultado.cambios === 0) {
        return null;
    }

    return consultarPorId(id);
}

// 5. Eliminar un activo
async function eliminar(id) {
    const resultado = await ejecutar(
        'DELETE FROM activos WHERE id = ?',
        [id]
    );

    return resultado.cambios > 0;
}

module.exports = {
    listar,
    consultarPorId,
    crear,
    actualizar,
    eliminar
};
