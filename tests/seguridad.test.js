const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Seguridad de Rutas y Middleware (Dynamis API)', () => {
    let tokenValido = '';

    beforeAll(async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@dynamis.com', password: '123' });
        tokenValido = res.body.token;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('Debería bloquear el acceso al historial si no se envía un Token (401 o 403)', async () => {
        const res = await request(app).get('/api/ventas');
        
        expect(res.statusCode).toBeGreaterThanOrEqual(401);
        expect(res.body).toHaveProperty('error');
    });

    it('Debería permitir el acceso al historial con un Token válido (200)', async () => {
        const res = await request(app)
            .get('/api/ventas')
            .set('Authorization', `Bearer ${tokenValido}`);
        
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });
});