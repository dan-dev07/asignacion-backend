const mongoose = require('mongoose');
require('dotenv').config();

const dbConnection = async ()=>{
  try {
    await mongoose.connect(process.env.DB_CNN, {autoIndex: false});
    console.log('DB conectada');
  } catch (error) {
    console.log('No se pudo conectar a la DB',error);
  };
};

module.exports = {
  dbConnection
};