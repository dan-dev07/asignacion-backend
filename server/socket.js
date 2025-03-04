const { agregarConversacion, buscarNumeroExistenteConversacion } = require("../controller/conversacion");
const { obtenerNumerosExternos, agregarProveedor, guardarReplyMensajeEnviado, guardarMensajeEnviado } = require("../controller/proveedor");
const { SendTemplateWhatsApp, SendReplyMessageWhatsApp, SendMessageWhatsApp } = require("../controller/whatsapp");
const Proveedor = require("../models/proveedor");
const { MensajeError } = require("../utils/error");
const { comprobarJWT } = require("../utils/jwt");

const SocketServer = (io) => {
  io.on('connection', async (socket) => {
    const [valido, user] = comprobarJWT(socket.handshake.query['auth']);
    if (!valido) {
      console.log('socket no identificado');
      return socket.disconnect();
    };
    console.log('Nuevo cliente conectado:', user.nombre);
    socket.join(user.uid);

    //enviar todos los mensajes
    socket.emit('todos-los-contactos', await obtenerNumerosExternos());

    //enviar template
    socket.on('enviar-template', async (datos, callback) => {
      const {telefono} = datos;
      const existeTel = await Proveedor.findOne({telefono:52 + telefono});
      if (existeTel === null) {
        const mensaje = await SendTemplateWhatsApp(telefono);
        if (mensaje.ok) {
          const proveedor = await agregarProveedor(datos, mensaje.mensajeId);
          io.emit('todos-los-contactos', await obtenerNumerosExternos());
          callback(proveedor);
          return; 
        };
        callback(mensaje);

      }else {
        const err = MensajeError('El usuario ya existe', null, false);
        callback(err);
      };
    });

    //iniciar conversación
    socket.on('mensaje-enviado', async (datos) => {
      const { telefono, emisor, fecha, leido, mensaje, user, tipo, message_id } = datos;
      let mensajeId = '';
      if (message_id?.startsWith('wamid.')) {
        mensajeId = await SendReplyMessageWhatsApp(mensaje, telefono, message_id);
        const datos = { user ,emisor, fecha, leido, mensaje, tipo, mensajeId, context:{message_id}};
        const {ultimo} = await guardarReplyMensajeEnviado(telefono, datos);
        io.emit('mensaje-recibido', { ultimo, telefono });
      } else {
        mensajeId = await SendMessageWhatsApp(mensaje, telefono);
        const datos =  { user, emisor, fecha, leido, mensaje, tipo, mensajeId };
        const {ultimo} = await guardarMensajeEnviado(telefono, datos);
        io.emit('mensaje-recibido', { ultimo, telefono });
      };
      io.emit('todos-los-contactos', await obtenerNumerosExternos());
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', user.nombre);
    });
  });
};


module.exports = {
  SocketServer,
};