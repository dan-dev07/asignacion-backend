const { response } = require('express');
const Proveedor = require('../models/proveedor');

const mensajesContactos = async (req, res = response) => {
  try {
    const mensajesContactos = await Proveedor.find();
    if (!mensajesContactos) {
      return [];
    };
    const ultimoMensajeArray = mensajesContactos.map(m => {
      const { mensajes, telefono, uid, datosExterno } = m;
      const ultimo = mensajes[mensajes.length - 1];
      return {
        telefono,
        uid,
        fecha: ultimo.fecha,
        emisor: ultimo.emisor,
        tipo: ultimo.tipo,
        mensaje: ultimo.mensaje,
        datosExterno,
      };
    });
    res.status(200).json({
      mensajes: ultimoMensajeArray
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al obtener todos los mensajes'
    });
  }
};

const getChat = async (req, res = response) => {
  try {
    const { telefono } = req.body;
    const externoActual = await Proveedor.findOne({ telefono });
    const { mensajes } = externoActual;
    const mensajesLeidos = mensajes.map(c => {
      if (c.emisor === 'Externo') {
        c.leido = true;
      };
      return c;
    });
    const contactoActualizado = await Proveedor.findOneAndUpdate({ telefono }, { mensajes: mensajesLeidos }, { new: true });
    const { mensajes: mensajesAct, datosExterno } = contactoActualizado;
    res.send({ mensajes:mensajesAct, telefono, datosExterno });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'No se pudo cargar la conversación'
    });
  };
};

const actualizarDatosContacto = async (req, res = response) => {
  try {
    const { nombre, apellido, empresa, telefono, uid } = req.body;
    const externoActualizado = await Proveedor.findOneAndUpdate({ telefono, uid }, {
      datosExterno: {
        nombre,
        apellido,
        empresa,
      }
    }, { new: true });
    const { datosExterno } = externoActualizado;
    res.send(datosExterno);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'No se pudo cargar la conversación'
    });
  };
};

//Paginación
const getChatPaginacion = async (req, res = response) => {
  try {
    const {telefono, uid, pagina, limite = 10} = req.body;
    const pacienteActual = await Paciente.findOne({telefono, 'usuarioAsignado.uid': uid});
    const {chats} = pacienteActual;
    const mensajesLeidos = chats.map(c=> {
      if (c.emisor === 'Paciente') {
        c.leido = true;
      };
      return c;
    });
    const startIndex = (pagina - 1) * limite;
    const endIndex = page * limite;
    const mensajesPorPagina = mensajesLeidos.slice(startIndex, endIndex);
    //Calcular el total de páginas
    const mensajesTotales = mensajesLeidos.length;
    const paginasTotales = Math.ceil(mensajesTotales / limite);

    //Enviar mensajes paginados
    res.status(200).json({
      mensajesPorPagina,
      mensajesTotales,
      pagina,
      paginasTotales
    })

  } catch (error) {
    
  }
};

module.exports = {
  actualizarDatosContacto,
  getChat,
  mensajesContactos,
};