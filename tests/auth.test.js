const request = require('supertest');
const app = require('../server'); // Ajustá la ruta si tu server.js está en otra carpeta
const mongoose = require('mongoose');

describe('Autenticación de Usuarios (Dynamis API)', () => {
    
    // Desconectamos la base de datos al terminar para que el proceso no quede colgado
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('Debería iniciar sesión correctamente con credenciales válidas', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@dynamis.com',
                password: '123' // Las credenciales que configuramos en el Seeder
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.usuario.rol).toEqual('Admin');
    });

    it('Debería rechazar el inicio de sesión con contraseña incorrecta', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@dynamis.com',
                password: 'clave-equivocada-jaja'
            });

        expect(res.statusCode).toBeGreaterThanOrEqual(400);
        expect(res.body).toHaveProperty('error');
    });
});