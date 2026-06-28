const mongoose = require('mongoose');
require('dotenv').config();

const conectarDB = async () => {
    // Si ya hay una conexión activa o en curso, no abrir otra.
    if (mongoose.connection.readyState !== 0) {
        return mongoose.connection;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conexión exitosa a MongoDB Atlas establecida');
        return mongoose.connection;
    } catch (error) {
        console.error('Error de conexión a MongoDB Atlas:', error.message);
        process.exit(1);
    }
};

module.exports = conectarDB;