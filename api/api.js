const axios = require('axios');
const { MensajeError } = require('../utils/error');

const fetchApi = (url, responseType) => {
  try {
    const instance = axios({
      method: 'GET',
      url,
      responseType,
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`
      }
    });
    return instance;
  } catch (err) {
    MensajeError(`Error en fetchApi`, err, false);
  };
};

module.exports ={
  fetchApi,
};