const express = require('express');
const router = express.Router();

const activosController = require(
    '../controllers/activos.controller'
);

// Listar activos
router.get('/', activosController.listar);

// Consultar un activo
router.get('/:id', activosController.consultarPorId);

// Crear activo
router.post('/', activosController.crear);

// Actualizar activo
router.put('/:id', activosController.actualizar);

// Eliminar activo
router.delete('/:id', activosController.eliminar);

module.exports = router;
