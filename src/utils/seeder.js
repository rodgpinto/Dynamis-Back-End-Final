// Archivo: src/utils/seeder.js
const mongoose = require('mongoose');
const conectarDB = require('../../config/db');
const Comercio = require('../models/Comercio');
const Tienda = require('../models/Tienda');

const ejecutarSeeder = async () => {
    try {
        await conectarDB();
        
        const cantidad = await Comercio.countDocuments();

        if (cantidad > 0) {
            console.log('⚠️ La base de datos ya contiene información. Proceso abortado para evitar duplicados.');
            process.exit();
        }

        console.log('⏳ Inyectando datos de prueba...');

        // CASO 1: Comercio Activo con Tiendas Activas
        const comercio1 = await Comercio.create({
            nombre: 'Gastronomía Nipona S.A.',
            cuit: '30-98765432-1',
            estado: 'Activo'
        });

        await Tienda.create([
            { nombre: 'Shoyu Ramen Central', dominio: 'www.shoyuramencentral.com.ar', comercioId: comercio1._id, estado: 'Activa' },
            { nombre: 'Tamago Sando Express', dominio: 'www.tamagosandoexpress.com.ar', comercioId: comercio1._id, estado: 'Activa' }
        ]);

        // CASO 2: Comercio con Baja Lógica (Inactivo)
        await Comercio.create({
            nombre: 'Roshan LAN Center S.R.L.',
            cuit: '30-11112222-3',
            estado: 'Inactivo'
        });

        // CASO 3: Comercio Activo, pero con Tiendas Inactivas
        const comercio3 = await Comercio.create({
            nombre: 'Litoral Motors S.A.',
            cuit: '30-33334444-5',
            estado: 'Activo'
        });

        await Tienda.create([
            { nombre: 'Sucursal Versys Capital', dominio: 'www.versyscapital.com.ar', comercioId: comercio3._id, estado: 'Inactiva' },
            { nombre: 'Planta Ensambladora Venado Tuerto', dominio: 'www.ensamblaje-vt.com.ar', comercioId: comercio3._id, estado: 'Inactiva' }
        ]);

        console.log(' Datos de prueba inyectados con éxito.');
        process.exit();

    } catch (error) {
        console.error(' Error al ejecutar el Seeder:', error.message);
        process.exit(1);
    }
};

ejecutarSeeder();