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
    const { telefono, mensajesChatActual } = req.body;
    const cargaMensajes = async (corte) => {
      const proveedorActual = await Proveedor.aggregate([
        { $match: { telefono } },
        {
          $project: {
            mensajes: { $slice: corte },
            telefono: 1,
            datosExterno: 1,
            _id: 0,
            tamMensajes: { $size: "$mensajes" }
          }
        },
      ]);
      return proveedorActual[0];
    };

    //cortes
    if (Object.keys(mensajesChatActual).length === 0) {
      console.log('primera carga: ', mensajesChatActual);
      const corte = ["$mensajes", -10];
      const datos = await cargaMensajes(corte);
      return res.send(datos);
    } else {
      const { mensajeFinal, mensajeInicial, mensajesTotales } = mensajesChatActual;
      const tamanioCorte = 20;
      let pagina = 1;
      let encontrado = false;
      let corte = [];
      let limiteMensajes = false;
      let mensajeEncontrado = {};
      let index;

      while (!encontrado && !limiteMensajes) {
        corte = ["$mensajes", -(tamanioCorte * pagina), tamanioCorte];
        const { mensajes, tamMensajes, telefono, datosExterno } = await cargaMensajes(corte);
        mensajes.reverse();
        index = mensajes.findIndex(m => m.mensajeId === mensajeInicial.mensajeId);
        mensajeEncontrado = mensajes.slice(index + 1, index + 1 + 3).reverse();
        console.log('mensajeEncontrado; ', mensajeEncontrado);
        if (index === -1) {
          pagina++;
          continue;
        };

        if (tamanioCorte * pagina > tamMensajes) {
          limiteMensajes = true;
        };
        if (mensajeEncontrado.length < 3) {
          pagina++;  // Si hay menos de 3 mensajes, suma una página
          continue;  // Repite el ciclo y carga los nuevos mensajes
        }
        if (mensajeEncontrado.length) {
          encontrado = true;
        };
        
        console.log('while');
        res.send({ mensajes: mensajeEncontrado, telefono, datosExterno });
      };
    };
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