const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Comercio = require('../models/Comercio');
const Tienda = require('../models/Tienda');
const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Venta = require('../models/Venta');

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB para inyectar datos...');
    } catch (error) {
        console.error('❌ Error conectando a BD:', error);
        process.exit(1);
    }
};

const importarDatos = async () => {
    try {
        // 1. LIMPIEZA DE LA BASE DE DATOS
        console.log('🧹 Limpiando base de datos...');
        await Promise.all([
            Comercio.deleteMany(), Tienda.deleteMany(), 
            Usuario.deleteMany(), Producto.deleteMany(), Venta.deleteMany()
        ]);

        const salt = await bcrypt.genSalt(10);
        const passHash = await bcrypt.hash('123', salt); // Contraseña universal para todos

        // 2. CREAR COMERCIOS
        console.log('🏢 Creando Comercios y Tiendas...');
        const comercios = await Comercio.insertMany([
            { nombre: 'TechStore Arg', cuit: '30-11111111-1', estado: 'Activo' },
            { nombre: 'ElectroHogar S.A.', cuit: '30-22222222-2', estado: 'Activo' },
            { nombre: 'Bazar Central', cuit: '30-33333333-3', estado: 'Activo' }
        ]);

       // 3. CREAR TIENDAS
        console.log('🏪 Creando Tiendas con sus dominios...');
        const tiendas = await Tienda.insertMany([
            { nombre: 'Sucursal Centro', comercioId: comercios[0]._id, dominio: 'techstore-centro.dynamis.com', estado: 'Activa' },
            { nombre: 'Sucursal Norte', comercioId: comercios[0]._id, dominio: 'techstore-norte.dynamis.com', estado: 'Activa' },
            { nombre: 'Local Principal', comercioId: comercios[1]._id, dominio: 'electro-principal.dynamis.com', estado: 'Activa' },
            { nombre: 'Depósito Sur', comercioId: comercios[2]._id, dominio: 'bazar-sur.dynamis.com', estado: 'Activa' }
        ]);

        // 4. CREAR USUARIOS (Admins, Dueños y Empleados)
        console.log('👥 Creando Usuarios...');
        const usuariosData = [
            // 3 Admins
            { nombre: 'Admin', apellido: 'Uno', email: 'admin@dynamis.com', password: passHash, rol: 'Admin' },
            { nombre: 'Admin', apellido: 'Dos', email: 'admin2@dynamis.com', password: passHash, rol: 'Admin' },
            { nombre: 'Admin', apellido: 'Tres', email: 'admin3@dynamis.com', password: passHash, rol: 'Admin' },
            
            // 3 Dueños 
            { nombre: 'Carlos', apellido: 'Tech', email: 'comercio@techstore.com', password: passHash, rol: 'Dueño', comercioId: comercios[0]._id, comercioNombre: comercios[0].nombre },
            { nombre: 'María', apellido: 'Electro', email: 'comercio@electro.com', password: passHash, rol: 'Dueño', comercioId: comercios[1]._id, comercioNombre: comercios[1].nombre },
            { nombre: 'Jorge', apellido: 'Bazar', email: 'comercio@bazar.com', password: passHash, rol: 'Dueño', comercioId: comercios[2]._id, comercioNombre: comercios[2].nombre },
            
            // Empleados
            { nombre: 'Leo', apellido: 'Vendedor', email: 'empleado@techstore.com', password: passHash, rol: 'Empleado', comercioId: comercios[0]._id, comercioNombre: comercios[0].nombre },
            { nombre: 'Ana', apellido: 'Cajera', email: 'empleada@electro.com', password: passHash, rol: 'Empleado', comercioId: comercios[1]._id, comercioNombre: comercios[1].nombre }
        ];
        const usuarios = await Usuario.insertMany(usuariosData);

        // 5. CREAR PRODUCTOS REALISTAS
        console.log('📦 Llenando el inventario...');
        const nombresProductos = ['Notebook Dell', 'Mouse Logitech', 'Teclado Mecánico', 'Monitor Samsung 24"', 'Auriculares Sony', 'Impresora HP', 'Silla Gamer', 'Escritorio', 'Pendrive 64GB', 'Cargador Universal'];
        let productosData = [];
        
        for (let i = 0; i < 20; i++) {
            const tiendaRandom = tiendas[Math.floor(Math.random() * tiendas.length)];
            productosData.push({
                nombre: `${nombresProductos[Math.floor(Math.random() * nombresProductos.length)]} - Mod ${i}`,
                precio: Math.floor(Math.random() * (150000 - 5000) + 5000),
                stock: Math.floor(Math.random() * 50) + 5,
                estado: 'Activo',
                tiendaId: tiendaRandom._id
            });
        }
        const productos = await Producto.insertMany(productosData);

        // 6. CREAR VENTAS HISTÓRICAS (Últimos 30 días)
        console.log('💰 Simulando historial de ventas...');
        let ventasData = [];
        const empleados = usuarios.filter(u => u.rol === 'Empleado');

        for (let i = 0; i < 30; i++) {
            const productoRandom = productos[Math.floor(Math.random() * productos.length)];
            const empleadoRandom = empleados[Math.floor(Math.random() * empleados.length)];
            const cantidad = Math.floor(Math.random() * 3) + 1;
            
            // Fecha aleatoria de los últimos 30 días
            const fechaRandom = new Date();
            fechaRandom.setDate(fechaRandom.getDate() - Math.floor(Math.random() * 30));

            ventasData.push({
                productoId: productoRandom._id,
                usuarioId: empleadoRandom._id,
                cantidad: cantidad,
                precioUnitario: productoRandom.precio,
                total: productoRandom.precio * cantidad,
                createdAt: fechaRandom, // Forzamos la fecha para los gráficos futuros
                updatedAt: fechaRandom
            });
        }
        await Venta.insertMany(ventasData);

        console.log('🎉 ¡Base de datos poblada exitosamente! Todas las contraseñas son: 123');
        process.exit();
    } catch (error) {
        console.error('❌ Error al importar datos:', error);
        process.exit(1);
    }
};

conectarDB().then(importarDatos);