const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const conectarDB = require('./config/db');
const Comercio = require('./src/models/Comercio');
const Tienda = require('./src/models/Tienda');
const productoRoutes = require('./src/routes/productoRoutes');
const ventaRoutes = require('./src/routes/ventaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;


conectarDB();

async function inicializarBaseDeDatos() {
    try {
        const cantidad = await Comercio.countDocuments();

        if (cantidad === 0) {
            console.log('Base de datos vacía detectada. Agregnado datos de prueba...');

            // --- CASO 1: Comercio Activo con Tiendas Activas ---
            const comercio1 = await Comercio.create({
                nombre: 'Gastronomía Nipona S.A.',
                cuit: '30-98765432-1',
                estado: 'Activo'
            });

            await Tienda.create([
                { nombre: 'Shoyu Ramen Central', dominio: 'www.shoyuramencentral.com.ar', comercioId: comercio1._id, estado: 'Activa' },
                { nombre: 'Tamago Sando Express', dominio: 'www.tamagosandoexpress.com.ar', comercioId: comercio1._id, estado: 'Activa' }
            ]);

            // --- CASO 2: Comercio con Baja Lógica (Inactivo) ---
            await Comercio.create({
                nombre: 'Roshan LAN Center S.R.L.',
                cuit: '30-11112222-3',
                estado: 'Inactivo'
            });

            // --- CASO 3: Comercio Activo, pero con Tiendas Inactivas ---
            const comercio3 = await Comercio.create({
                nombre: 'Litoral Motors S.A.',
                cuit: '30-33334444-5',
                estado: 'Activo'
            });

            await Tienda.create([
                {
                    nombre: 'Sucursal Versys Capital',
                    dominio: 'www.versyscapital.com.ar',
                    comercioId: comercio3._id,
                    estado: 'Inactiva'
                },
                {
                    nombre: 'Planta Ensambladora Venado Tuerto',
                    dominio: 'www.ensamblaje-vt.com.ar',
                    comercioId: comercio3._id,
                    estado: 'Inactiva'
                }
            ]);

            console.log('Datos de prueba inyectados con éxito.');
        }
    } catch (error) {
        console.error('Error al ejecutar el Seeder:', error.message);
    }
}
inicializarBaseDeDatos();

const comercioRoutes = require('./src/routes/comercioRoutes');
const tiendaRoutes = require('./src/routes/tiendaRoutes');
const { validarBodyVacio } = require('./src/middlewares/validator');

app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(express.json());
app.use(validarBodyVacio);

app.use('/api/comercios', comercioRoutes);
app.use('/api/tiendas', tiendaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/auth', authRoutes);
app.get('/dashboard', async (req, res) => {
    try {
        const listaDeComercios = await Comercio.find().lean();
        const listaDeTiendas = await Tienda.find().lean();

        const comerciosConSusTiendas = listaDeComercios.map(comercio => {
            return {
                ...comercio,
                tiendas: listaDeTiendas.filter(t => t.comercioId.toString() === comercio._id.toString())
            };
        });

        res.render('index', { comercios: comerciosConSusTiendas });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno al cargar el dashboard");
    }
});

app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

app.listen(PORT, () => {
    console.log(`Servidor levantado en http://localhost:${PORT}/dashboard`);
});