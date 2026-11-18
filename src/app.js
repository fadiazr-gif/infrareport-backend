
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { initDb } = require('./db/database');
const activosRoutes = require('./routes/activos.routes');

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || '*'
}));
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
    res.status(200).json({
        proyecto: 'InfraReport',
        descripcion: 'Sistema de diagnóstico de infraestructura tecnológica',
        version: '1.0.0',
        estado: 'Servidor funcionando correctamente'
    });
});

// Rutas de activos tecnológicos
app.use('/api/activos', activosRoutes);

// Rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada'
    });
});

// Middleware centralizado de errores
app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: 'Formato JSON inválido'
        });
    }

    const codigo = error.status || 500;

    if (codigo >= 500) {
        console.error(error);
    }

    res.status(codigo).json({
        error: codigo >= 500
            ? 'Error interno del servidor'
            : error.message
    });
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Inicializar base de datos
initDb()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log('--------------------------------');
            console.log('INFRAREPORT - BACKEND');
            console.log(`Servidor: http://localhost:${server.address().port}`);
            console.log('Base de datos: SQLite');
            console.log('API: /api/activos');
            console.log('--------------------------------');
        });
    })
    .catch((error) => {
        console.error('Error iniciando InfraReport:', error);
        process.exit(1);
    });
