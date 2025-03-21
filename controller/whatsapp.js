const {response} = require('express');
const axios = require('axios');
const Proveedor = require('../models/proveedor');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');
const { typeMessages } = require('../cons/typeMessages');
const { authFacebook } = require('../cons/optionsMessage');
const { urlMeta } = require('../cons/urls');
const { buscarNumeroExistente, obtenerNumerosExternos, agregarProveedor } = require('./proveedor');
const { numeroTelefono } = require('../utils/crearTelefono');
const { newFecha } = require('../utils/fecha');
const { MensajeError } = require('../utils/error');
const { SampleText, TemplateText, ReplyText } = require('../utils/textTypes');
const { rutaDescargaArchivoRecibido } = require('../utils/manejoArchivos');
const { mostrarDatosEntradaWhatsapp } = require('../utils/mostrarMensajeWhatsapp');

const Whatsapp = async (req, res = response) => {
  //Aqui empieza con la llegada de los mensajes desde whatsapp
  try {
    const entry = req.body['entry'][0];
    const changes = entry['changes'][0];
    const value = changes['value'];
    const messageObject = value['messages'];
    if (messageObject) {
      const type = messageObject[0]['type'];
      const messages = messageObject[0];

      if (type === 'text') {
        await processMessage(req, messages);
      } else if (type === 'button') {
        await processMessage(req, messages);
      } else if (type === 'interactive') {
        mostrarDatosEntradaWhatsapp(entry);
      }else if (type === 'location') {
        console.log(messageObject);
      }else{
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
  let messageContent;
  if (type === 'text') {
    messageContent = messages['text']['body'];
  }else if (type ==='button') {
    messageContent = messages['button']['text'];
  }else{
    messageContent = typeMessages[type];
  };

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
      return MensajeError('Error al enviar la plantilla', res.statusText, false);
    };
    const {messages} = res.data;
    return {
      ok:true,
      mensajeId:messages[0].id
    };
  } catch (error) {
    return MensajeError('Error al enviar la Plantilla',error, false);
  };
};

const GuardarMensajeRecibido = async (datos) => {
  try {
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

const SendReplyMessageWhatsApp = async (textResponse, number, id) => {
  try {
    const data = ReplyText(number, textResponse, id);
    const res = await axios.post(`${urlMeta}/messages`, data, authFacebook);
    if (res.status !== 200) {
      return MensajeError('Error al enviar el mensaje en -->SendReplyMessageWhatsapp', res.statusText, false);
    };
    const {messages} = res.data;
    return messages[0].id;  
  } catch (error) {
    return MensajeError('Error en -->SendReplyMessageWhatsApp', error, false);
  };
};

const SetFileWhatsApp = async (filename, mimetype) => {
  const ruta = path.join(__dirname, 'uploads/', filename);
  const formData = new FormData();
  formData.append('file', (ruta));
  formData.append('messaging_product', 'whatsapp');
  formData.append('type', mimetype);

  try {

    const resApiWhatsapp = await axios.postForm(`${urlMeta}/media`, {
      "file": fs.createReadStream(ruta),
      "messaging_product": "whatsapp",
      "type": mimetype
    }, {
      headers: {
        ...formData.getHeaders(),
        "Authorization": `Bearer ${process.env.WHATSAPP_API_KEY}`
      },
    });
    if (resApiWhatsapp.statusText !== "OK") {
      return false;
    }
    return resApiWhatsapp.data
  } catch (e) {
    const err = MensajeError('Error al cargar el archivo', e, false);
    return err;
  };
};

const SendFileWhatsApp = async (data) => {
  try {
    const res = await axios.post(`${urlMeta}/messages`, data, authFacebook);
    if (res.status !== 200) {
      return MensajeError('Error al enviar el mensaje en -->SendFileWhatsApp', res.statusText, false);
    };
    const {messages} = res.data;
    return messages[0];  
  } catch (error) {
    return MensajeError('Error en -->SendFileWhatsApp', error, false);
  };
};

const GuardarMensajeRecibidoBoton =async (datos) => {
  try {
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
  GuardarMensajeRecibido,
  SendFileWhatsApp,
  SendMessageWhatsApp,
  SendReplyMessageWhatsApp,
  SendTemplateWhatsApp,
  SetFileWhatsApp,
  VerifyToken,
  Whatsapp,
};