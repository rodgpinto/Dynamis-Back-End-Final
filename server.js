const express = require('express');
const path = require('path');
const cors = require('cors');

// 1. Importación de Base de Datos y Modelos
const conectarDB = require('./config/db');
const Comercio = require('./src/models/Comercio');
const Tienda = require('./src/models/Tienda');

// 2. Importación de Rutas y Middlewares
const authRoutes = require('./src/routes/authRoutes');
const comercioRoutes = require('./src/routes/comercioRoutes');
const tiendaRoutes = require('./src/routes/tiendaRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const ventaRoutes = require('./src/routes/ventaRoutes');
const { validarBodyVacio } = require('./src/middlewares/validator');

// Inicialización
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Conexión a MongoDB Atlas
conectarDB();


// 4. Middlewares Globales
app.use(cors());
app.use(express.json());

// 5. Archivos Estáticos (FrontEnd)
// Al definir el FrontEnd antes del validador estricto, evitamos que bloquee la carga visual
app.use(express.static(path.join(__dirname, 'public')));

// 6. Middlewares Específicos
// Aplicamos el validador de body exclusivamente a los endpoints de la API
app.use('/api', validarBodyVacio);

// 7. Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/comercios', comercioRoutes);
app.use('/api/tiendas', tiendaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);

// 8. Inicialización del Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Dynamis activo y escuchando en http://localhost:${PORT}`);
});