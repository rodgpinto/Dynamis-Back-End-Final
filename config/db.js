const mongoose = require('mongoose');
require('dotenv').config(); 
const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conexión exitosa a MongoDB Atlas establecida');
    } catch (error) {
        console.error('Error de conexión a MongoDB Atlas:', error.message);
        process.exit(1);
    }
};

module.exports = conectarDB;