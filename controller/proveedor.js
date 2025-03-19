const {v4:uuidv4} = require('uuid');
const Proveedor = require('../models/proveedor');
const Conversacion = require('../models/conversacion');
const { MensajeError } = require('../utils/error');
const { newFecha } = require('../utils/fecha');

const obtenerNumerosExternos = async () => {
  try {
    const externo = await Proveedor.find();
    if (!externo) {
      return [];
    };
    const numerosExterno = externo.map(m => {
      const { telefono, uid, datosExterno, mensajes} = m;
      const ultimoMensaje = mensajes[mensajes.length - 1];
      return {
        telefono: telefono,
        uid,
        datosExterno,
        fecha:ultimoMensaje.fecha,
        emisor:ultimoMensaje.emisor,
        tipo:ultimoMensaje.tipo,
        mensaje:ultimoMensaje.mensaje
      };
    });
    return {
      contactos: numerosExterno.sort((a, b) => {
        // Convertir las fechas de formato "DD/MM/YYYY, HH:MM:SS" a "YYYY-MM-DD HH:MM:SS"
        const formatFecha = (fecha) => {
          const [fechaParte, horaParte] = fecha.split(','); // Separar la fecha de la hora
          const [dia, mes, año] = fechaParte.split('/'); // Desestructurar la fecha
          return `${año}-${mes}-${dia} ${horaParte.trim()}`; // Formato "YYYY-MM-DD HH:MM:SS"
        };
      
        const fechaA = new Date(formatFecha(a.fecha));
        const fechaB = new Date(formatFecha(b.fecha));
      
        return fechaA - fechaB; // Comparar las fechas numéricamente
      }).reverse()
    };

  } catch (error) {
    const err = MensajeError('No se cargaron los numeros', error, false);
    return err;
  };
};

const agregarProveedor = async (datos, mensajeId) => {
  try {
    const {telefono, nombre, apellido, empresa} = datos;
    const proveedor = await Proveedor.findOne({ telefono });
    if (!proveedor) {
      const datosExterno = {nombre, apellido, empresa};
      const mensaje = {
        fecha: newFecha(),
        emisor:'Escotel',
        tipo:'text',
        mensaje:'template',
        mensajeId,
        leido:false
      };
      const mensajes = [mensaje];
      const uid = uuidv4();
      const nuevoProveedor = await Proveedor.create({ telefono, uid, datosExterno, mensajes});
      return {ok:true, uid:nuevoProveedor.uid };
    }else{
      const actProveedor = await Proveedor.findOneAndUpdate({telefono}, {
        $push:{
          mensajes:{
            fecha: newFecha(),
            emisor:'Escotel',
            tipo:'text',
            mensaje:'Saludos! \n ¿Me puedes ayudar a cotizar un  servicio? Por favor.',
            mensajeId,
            leido:false
          }
        }
      });
      return {ok:true, uid:actProveedor.uid };
    };
  } catch (error) {
    const err = MensajeError('No se guardó el numero del contacto', error, false);
    return err;
  };
};

const agregarMensaje = async (datos)=>{
  try {
    const fecha = newFecha();
    const uid = uuidv4();
    const mensajes = { fecha, emisor, tipo, urlDocumento, filename, mensaje, mensajeId:id, context, caption};
    // buscar en pendientes y actualizar
    const mensajeProveedor = await Proveedor.findOne({ telefono });
    if (!mensajeProveedor) {
      //guardar mensaje
      const proveedor = await Conversacion.create({ telefono, uid, mensajes });
      return {ok:true, uid:proveedor.uid };
    };
    const res = await Proveedor.findOneAndUpdate({ telefono },
      { $push: { mensajes } },
      { new: true }
    );

    return {ok:true, uid:res.uid};
  } catch (error) {
    const err = MensajeError('No se pudo guardar el mensaje', error, false);
    return err;
  };
};

const buscarNumeroExistente = async (telefono) => {
  try {
    const numeroExistente = await Proveedor.findOne({ telefono });
    if (!numeroExistente) {
      return {
        ok: true,
        existe: false
      };
    };
    return {
      ok: true,
      existe:true
    };
  } catch (error) {
    const err = MensajeError('Error al buscar el número de contacto', error, false);
    return err;
  }
};

const guardarMensajeEnviado = async (telefono, mensaje) => {
  try {
    const externo = await Proveedor.findOneAndUpdate(
      { telefono },
      {
        $push: {
          mensajes: mensaje
        }
      },
      { new: true });
    const ultimo = {ok:true, ultimo:externo.mensajes[externo.mensajes.length - 1]};
    return ultimo;
  } catch (error) {
    const err = MensajeError('Error al guardar el mensaje enviado', error, false);
    return err;
  };
};

const guardarReplyMensajeEnviado = async (telefono, mensaje) => {
  try {
    const externo = await Proveedor.findOneAndUpdate(
      { telefono },
      {
        $push: {
          mensajes: mensaje
        }
      },
      { new: true });
    const ultimo = {ok:true, ultimo:externo.mensajes[externo.mensajes.length - 1]};   
    return ultimo;
  } catch (error) {
    const err = MensajeError('Error al guardar -ReplyMensajeEnviado-', error, false);
    return err;
  };
};

const guardarArchivoEnviado = async (telefono, mensaje, urlDocumento, tipo, filename) => {
  try {
    const fecha = newFecha();
    const nuevoMensaje = {
      fecha,
      emisor: 'Escotel',
      tipo,
      filename,
      urlDocumento,
      mensaje: tipo === 'image' ? "Imagen enviado" : "Documento enviado",
      mensajeId:mensaje.id,
      leido: false,
    }
    const externo = await Proveedor.findOneAndUpdate(
      { telefono },
      { $push: { mensajes: nuevoMensaje } },
      { new: true });
    const ultimo = externo.mensajes[externo.mensajes.length - 1];
    return {
      ok: true,
      ultimo
    };
  } catch (error) {
    return MensajeError('No se pudo guardar el archivo', error,false);
  };
}

module.exports = {
  agregarMensaje,
  agregarProveedor,
  buscarNumeroExistente,
  guardarArchivoEnviado,
  guardarMensajeEnviado,
  guardarReplyMensajeEnviado,
  obtenerNumerosExternos,
};