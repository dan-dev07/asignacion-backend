const {response} = require('express');
const axios = require('axios');
const Proveedor = require('../models/proveedor');
const { typeMessages } = require('../cons/typeMessages');
const { authFacebook } = require('../cons/optionsMessage');
const { urlMeta } = require('../cons/urls');
const { numeroTelefono } = require('../utils/crearTelefono');
const { buscarNumeroExistente, agregarProveedor, obtenerNumerosExternos } = require('./proveedor');
const { newFecha } = require('../utils/fecha');
const { MensajeError } = require('../utils/error');
const { SampleText, TemplateText } = require('../utils/textTypes');
const { rutaDescargaArchivoRecibido } = require('../utils/manejoArchivos');

const Whatsapp = async (req, res = response) => {
  //Aqui empieza con la llegada de los mensajes desde whatsapp
  try {
    const entry = req.body['entry'][0];
    const changes = entry['changes'][0];
    const value = changes['value'];
    const messageObject = value['messages'];
    console.log(messageObject);
    if (messageObject) {
      const type = messageObject[0]['type'];
      const messages = messageObject[0];

      if (type === 'text') {
        await processMessage(req, messages);
      } else {
        const { ruta:urlDocumento, filename, caption } = await rutaDescargaArchivoRecibido(messages);
        await processMessage(req, messages, { urlDocumento, filename, caption });
      };
    };
    res.send('EVENT_RECEIVED');
  } catch (error) {
    console.log(error);
    res.send('EVENT_RECEIVED');
  };
};

const processMessage = async (req, messages, additionalData = {}) => {
  const { type, from, id, context } = messages;
  const number = numeroTelefono(from);
  const messageContent = type === 'text' ? messages['text']['body'] : typeMessages[type];
  const datos = {id, messageContent, number, type, context, additionalData};
  const telExistente = await buscarNumeroExistente(number);
  if (telExistente.existe) {
    const {mensaje} = await GuardarMensajeRecibido(datos);
    req.io.emit('todos-los-contactos', await obtenerNumerosExternos());
    req.io.emit('mensaje-recibido', { ultimo: mensaje, telefono: number });
  };
};

const VerifyToken = (req, res = response) => {
  try {
    const accessToken = process.env.ACCESS_TOKEN_WHATSAPP;
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (challenge !== null && token !== null && token == accessToken) {
      res.send(challenge);
    } else {
      res.status(400).send();
    };
  } catch (error) {
    res.status(400).send();
  };
};

const SendMessageWhatsApp = async (textResponse, number) => {
  try {
    const data = SampleText(number, textResponse);
    const res = await axios.post(`${urlMeta}/messages`, data, authFacebook);
    if (res.status !== 200) {
      return MensajeError('Error al enviar el mensaje', res.statusText, false);
    };
    const {messages} = res.data;
    return messages[0].id;  
  } catch (error) {
    return MensajeError('Error al enviar el mensaje', error, false);
  };
};

const SendTemplateWhatsApp = async (number) => {
  try {
    const data = TemplateText(number);
    const res = await axios.post(`${urlMeta}/messages`, data, authFacebook);
    if (res.status !== 200) {
      return MensajeError('Error al enviar el mensaje', res.statusText, false);
    };
    const {messages} = res.data;
    return {
      ok:true,
      mensajeId:messages[0].id
    };
  } catch (error) {
    return MensajeError('Error al enviar el mensaje',error, false);
  };
};

const GuardarMensajeRecibido = async (datos) => {
  try {
    console.log(datos);
    const {id, messageContent:texto, number:telefono, type:tipo, context, additionalData:{urlDocumento,filename, caption}} = datos;
    const mensaje = {
      fecha: newFecha(),
      emisor: 'Externo',
      tipo,
      filename,
      urlDocumento,
      caption,
      mensaje: texto,
      mensajeId: id,
      leido: false,
      context,
    };
    const conversacion = await Proveedor.findOneAndUpdate(
      { telefono },
      { $push: { mensajes: mensaje }},
      { new: true });
    const ultimoMsg = conversacion.mensajes[conversacion.mensajes.length - 1];
    const uid = conversacion.uid;
    return {
      ok: true,
      mensaje: ultimoMsg,
      uid
    };
  } catch (error) {
    return MensajeError('No se pudo guardar el mensaje', error, false);
  };
};

module.exports = {
  Whatsapp,
  VerifyToken,
  SendMessageWhatsApp,
  SendTemplateWhatsApp,
  GuardarMensajeRecibido
};