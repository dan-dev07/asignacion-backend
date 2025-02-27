const Conversacion = require('../models/conversacion');
const Usuario = require('../models/usuario');
const Proveedor = require('../models/proveedor');
const { MensajeError } = require('../utils/error');

const buscarNumeroExistenteConversacion = async (telefono) => {
  try {
    const conversacion = await Conversacion.findOne({ telefono });
    if (!conversacion) {
      return {
        ok: false,
      };
    };
    return {
      ok: true,
      conversacion
    };
  } catch (error) {
    const err = MensajeError('Hubo un erro al buscar la conversación', error, false);
    return err;
  };
};

const agregarConversacion = async (datos) => {
  try {
    const { datosExterno, externoUid, telefono, ultimaComunicacion, userUid } = datos;
    const externo = await Proveedor.findOne({ telefono, uid: externoUid });
    const user = Usuario.findOne({uid:userUid});
    const chats = [{
      fecha:'',
      emisor:'',
      tipo:'',
      urlDocumento:'',
      filename:'',
      mensaje:'',
      mensajeId:'',
      leido:false,
      caption:'',
      context:{
        message_id:'',
        from:'',
        id:''
      }
    }];
    const conversacion = await Conversacion.create({datosExterno, telefono, uid: externo.uid, usuarioAsignado: user.uid, ultimaComunicacion, chats});
    return {
      ok:true,
      conversacion
    };
  } catch (error) {
    const err = MensajeError('No se pudo guardar la conversacíon', error, false);
    return err;
  };
};

const obtenerMensajesPorUsuario = async (uid) => {
  try {
    const mensajesPorUsuario = (await Conversacion.find({ 'usuarioAsignado.uid': uid })).map(p => {
      const { telefono, chats, uid, datosExterno } = p;
      const ultimoMsg = chats[chats.length - 1];
      const { fecha, mensaje, leido, tipo, emisor } = ultimoMsg;
      return {telefono, uid, fecha, mensaje, leido, tipo, emisor, datosExterno };
    });
    return mensajesPorUsuario.sort((a, b) => {
      // Convertir las fechas de formato "DD/MM/YYYY, HH:MM:SS" a "YYYY-MM-DD HH:MM:SS"
      const formatFecha = (fecha) => {
        const [fechaParte, horaParte] = fecha.split(','); // Separar la fecha de la hora
        const [dia, mes, año] = fechaParte.split('/'); // Desestructurar la fecha
        return `${año}-${mes}-${dia} ${horaParte.trim()}`; // Formato "YYYY-MM-DD HH:MM:SS"
      };
    
      const fechaA = new Date(formatFecha(a.fecha));
      const fechaB = new Date(formatFecha(b.fecha));
    
      return fechaA - fechaB; // Comparar las fechas numéricamente
    }).reverse(); 
  } catch (error) {
    const err = MensajeError('No se pudo obtener los mensajes del usuario', error, false);
    return err;
  };
};

module.exports = {
  buscarNumeroExistenteConversacion,
  agregarConversacion,
  obtenerMensajesPorUsuario
};