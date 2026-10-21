const activosService = require('../services/activos.service');

// 1. Listar todos los activos
async function listar(req, res, next) {
    try {
        const activos = await activosService.listar();
        res.status(200).json(activos);
    } catch (error) {
        next(error);
    }
}

// 2. Consultar activo por ID
async function consultarPorId(req, res, next) {
    try {
        const activo = await activosService.consultarPorId(
            req.params.id
        );

        res.status(200).json(activo);
    } catch (error) {
        next(error);
    }
}

// 3. Crear activo tecnológico
async function crear(req, res, next) {
    try {
        const activo = await activosService.crear(req.body);
        res.status(201).json(activo);
    } catch (error) {
        next(error);
    }
}

// 4. Actualizar activo
async function actualizar(req, res, next) {
    try {
        const activo = await activosService.actualizar(
            req.params.id,
            req.body
        );

        res.status(200).json(activo);
    } catch (error) {
        next(error);
    }
}

// 5. Eliminar activo
async function eliminar(req, res, next) {
    try {
        await activosService.eliminar(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listar,
    consultarPorId,
    crear,
    actualizar,
    eliminar
};
