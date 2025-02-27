const { agregarConversacion, buscarNumeroExistenteConversacion } = require("../controller/conversacion");
const { obtenerNumerosExternos, agregarProveedor } = require("../controller/proveedor");
const { SendTemplateWhatsApp } = require("../controller/whatsapp");
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
    socket.on('iniciar-conversacion', async (datos, callback) => {
      const { telefono } = datos;
      const {mensajes} = await Proveedor.findOne({telefono});
      if (mensajes.length > 0) {
        const arrMensajes = mensajes.map( c => { 
          if(c.emisor === 'Externo'){
            c.leido = true;
          };
          return c;
        });
        callback({ok:true, mensajes:arrMensajes});
        return ;
      }else {
        const err = MensajeError('Sin mensajes para mostrar', null, false);
        callback(err);
      };
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', user.nombre);
    });
  });
};


module.exports = {
  SocketServer,
};