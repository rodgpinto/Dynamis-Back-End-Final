const express = require('express');
const path = require('path');
const cors = require('cors');

// --- 1. Importación de WebSockets, Base de Datos y Modelos ---
const http = require('http'); 
const { Server } = require('socket.io');
const conectarDB = require('./config/db');
const Comercio = require('./src/models/Comercio');
const Tienda = require('./src/models/Tienda');

// --- 2. Importación de Rutas y Middlewares ---
const authRoutes = require('./src/routes/authRoutes');
const comercioRoutes = require('./src/routes/comercioRoutes');
const tiendaRoutes = require('./src/routes/tiendaRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const ventaRoutes = require('./src/routes/ventaRoutes');
const { validarBodyVacio } = require('./src/middlewares/validator');

// --- Importación para Documentación (Swagger) ---
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Inicialización
const app = express();
const PORT = process.env.PORT || 3000;

// --- 3. Envoltura HTTP y configuración de Socket.io ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

// --- 4. Conexión a MongoDB Atlas ---
conectarDB();

// --- 5. Middlewares Globales ---
app.use(cors());
app.use(express.json());

// --- 6. Archivos Estáticos (FrontEnd) ---
app.use(express.static(path.join(__dirname, 'public')));

// --- 7. CONFIGURACIÓN DE SWAGGER (Documentación) ---
const swaggerSpec = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Dynamis API",
            version: "1.0.0",
            description: "Documentación oficial de la API REST del sistema SaaS Dynamis"
        },
        servers: [
            { url: "http://localhost:3000", description: "Desarrollo Local" },
            { url: "https://dynamis-back-end-final.onrender.com", description: "Producción (Render)" }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ["./src/routes/*.js"] 
};

// Exponer la interfaz gráfica de Swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(swaggerSpec)));

// --- 8. Endpoint de vida para UptimeRobot (Antes de validaciones) ---
app.get('/api/ping', (req, res) => {
    res.status(200).json({ status: 'OK', mensaje: 'Servidor activo 24/7' });
});

// --- 9. Middlewares Específicos (Afecta a todo lo que vaya a las rutas de negocio) ---
app.use('/api', validarBodyVacio);

// --- 10. Rutas de la API ---
app.use('/api/auth', authRoutes);
app.use('/api/comercios', comercioRoutes);
app.use('/api/tiendas', tiendaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);

// --- 11. Lógica de WebSockets (Chat por Roles) ---
io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    socket.on('unirseAConversacion', (data) => {
        if (!data || !data.usuarioId) return;

        if (data.rol === 'Admin') {
            socket.join('sala_soporte');
            console.log(`🛡️ Admin ${data.usuarioId} unido a la central de soporte.`);
        } else {
            const salaPrivada = `usuario_${data.usuarioId}`;
            socket.join(salaPrivada);
            console.log(`👤 Usuario ${data.usuarioId} unido a sala: ${salaPrivada}`);
        }
    });

    socket.on('mensaje_cliente', (data) => {
        if (data.rol === 'Admin') {
            const salaDestino = `usuario_${data.para}`;
            io.to(salaDestino).emit('mensaje_servidor', data);
            io.to('sala_soporte').emit('mensaje_servidor', data);
        } else {
            io.to('sala_soporte').emit('mensaje_servidor', data);
            const salaPrivada = `usuario_${data.usuarioId}`;
            io.to(salaPrivada).emit('mensaje_servidor', data);
        }
    });
});

// --- 12. Inicialización del Servidor ---
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`🚀 Servidor Dynamis activo y escuchando en el puerto http://localhost:${PORT}`);
        console.log(`📑 Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
    });
}

module.exports = app;