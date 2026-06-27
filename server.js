const express = require('express');
const path = require('path');
const cors = require('cors');

// 1. Importación de WebSockets, Base de Datos y Modelos
const http = require('http'); 
const { Server } = require('socket.io');
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

// 3. Envoltura HTTP y configuración de Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

// 4. Conexión a MongoDB Atlas
conectarDB();

// 5. Middlewares Globales
app.use(cors());
app.use(express.json());

// 6. Archivos Estáticos (FrontEnd)
app.use(express.static(path.join(__dirname, 'public')));

// 7. Middlewares Específicos
app.use('/api', validarBodyVacio);

// 8. Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/comercios', comercioRoutes);
app.use('/api/tiendas', tiendaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);

// 9. Lógica de WebSockets (Chat por Roles)
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

// 10. Inicialización del Servidor (ATENCIÓN: usamos server.listen, no app.listen)
if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`🚀 Servidor Dynamis activo y escuchando en http://localhost:${PORT}`);
    });
}
module.exports = app;