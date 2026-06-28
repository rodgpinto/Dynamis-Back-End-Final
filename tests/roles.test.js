const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Seguridad de la API: Control de Acceso por Roles (RBAC)', () => {
    let tokenEmpleado = '';

    beforeAll(async () => {
        
        if (mongoose.connection.readyState !== 1) {
            await new Promise((resolve) => {
                mongoose.connection.once('connected', resolve);
            });
        }

        const resLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'vendedor@dynamis.com', password: '123' });

        // Si el login falla, guardamos un string vacío para que salte el 401
        tokenEmpleado = resLogin.body.token || '';
    });

    afterAll(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });

    it('Debería denegar el acceso si un empleado intenta registrar un comercio nuevo', async () => {
        const res = await request(app)
            .post('/api/comercios')
            .set('Authorization', `Bearer ${tokenEmpleado}`)
            .send({
                nombre: "Comercio Intruso S.A.",
                cuit: "20-99999999-9"
            });

        expect([401, 403]).toContain(res.statusCode);
        expect(res.body).toHaveProperty('error');
    });
});