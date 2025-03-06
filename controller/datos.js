const { response, text } = require('express');
const Proveedor = require('../models/proveedor');
const { esSoloNumero } = require('../utils/esSoloNumero');
const { eliminarAcentos } = require('../utils/textoSinAcentos');
const { obtenerNumerosExternos } = require('./proveedor');

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
    res.status(200).json(ultimoMensajeArray);

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
    res.send({ mensajes: mensajesAct, telefono, datosExterno });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'No se pudo cargar la conversación'
    });
  };
};

const actualizarDatosContacto = async (req, res = response) => {
  try {
    const { nombre, apellido, empresa, telefono } = req.body;
    const externoActualizado = await Proveedor.findOneAndUpdate({ telefono: 52 + telefono }, {
      datosExterno: {
        nombre,
        apellido,
        empresa,
      }
    }, { new: true });
    const { datosExterno } = externoActualizado;
    req.io.emit('todos-los-contactos', await obtenerNumerosExternos());
    res.send(datosExterno);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'No se actualizaron los datos'
    });
  };
};

const busquedaPorTexto = async (req, res = response) => {
  try {
    const { texto } = req.body;
    let filtro = [];
    let aux = [];
    if (texto === '' || texto === null) {
      return res.send([]);
    };
    const busqueda = await Proveedor.find({
      mensajes: {
        $elemMatch: {
          mensaje: { $regex: texto.trim(), $options: 'i' }
        }
      }
    });
    const mensajesEncontrados = busqueda.flatMap(proveedor => {
      let filtrado = proveedor.mensajes.filter(mensaje => mensaje.mensaje.match(new RegExp(texto.trim(), 'i')));
      const nuevoArray = filtrado.map(m => {
        const { fecha, emisor, tipo, mensaje, mensajeId, leido, _id } = m;
        return {
          fecha,
          emisor,
          tipo,
          mensaje,
          mensajeId,
          leido,
          id: _id,
          telefono: proveedor.telefono,
          uid: proveedor.uid,
        }
      });
      return nuevoArray;
    });

    res.send(mensajesEncontrados);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Error al hacer la búsqueda por texto'
    });
  };
};

const busquedaPorNumero = async (req, res = response) => {
  try {
    const { numero } = req.body;
    if (esSoloNumero(numero) && (numero.length === 0)) {
      return res.send([]);
    };
    const busqueda = await Proveedor.find({ telefono: { $regex: numero } });
    if (!busqueda) return res.send([]);
    const arr = busqueda.map(m => {
      const { datosExterno, telefono, uid } = m;
      return { datosExterno, telefono, uid }
    })

    res.send(arr);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Error al hacer la búsqueda por numero'
    });
  };
};

const busquedaPorContacto = async (req, res = response) => {
  try {
    const { filtro } = req.body;
    if (esSoloNumero(filtro) && filtro.length > 0) {
      const busqueda = await Proveedor.find({ telefono: { $regex: filtro } });
      if (!busqueda) return res.send([]);
      const arr = busqueda.map(m => {
        const { datosExterno, telefono, uid, mensajes } = m;
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
      res.send(arr);
    } else if (typeof (filtro) === 'string' && filtro.length > 0) {
      const filtroSinAcento = eliminarAcentos(filtro);
      const busqueda = await Proveedor.find({ 
        'datosExterno.nombre': { $regex: filtroSinAcento, $options: 'i' }, 
      });
      if (!busqueda) return res.send([]);
      const arr = busqueda.map(m => {
        const { datosExterno, telefono, uid, mensajes } = m;
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
      res.send(arr);
    } else {
      res.send([])
    };

  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Error al hacer la búsqueda por numero'
    });
  };
};

module.exports = {
  actualizarDatosContacto,
  busquedaPorTexto,
  busquedaPorNumero,
  busquedaPorContacto,
  getChat,
  mensajesContactos,
};