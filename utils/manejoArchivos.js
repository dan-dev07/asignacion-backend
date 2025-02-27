const { fetchApi } = require("../api/api");
const { cargarArchivo } = require("./archivosExterno");
const { MensajeError } = require("./error");


const rutaDescargaArchivoRecibido = async (messages) => {
  const { type: tipo, from: telefono } = messages;
  let caption;
  let id;
  let filename;
  if (tipo === 'image') {
    id = messages['image']['id'];
    caption = messages['image']['caption'];
  } else if (tipo === 'document') {
    id = messages['document']['id'];
    caption = messages['document']['caption'];
    filename = messages['document']['filename'];
  } else if (tipo === 'audio') {
    id = messages['audio']['id'];
  } else if (tipo === 'video') {
    id = messages['video']['id'];
  };

  //obtener id de archivo y guardarlo
  try {
    const descarga = await obtenerDescarga(id);
    const ruta = await guardarArchivo(descarga, telefono, id, tipo, filename);
    if (ruta.error) {
      return ruta.msg;
    };
    return { ruta, filename, id, caption};
  } catch (error) {
    const err = MensajeError('Error en descargar y guardar el archivo entrante de whatsapp', error, false);
    return err;
  };
};

const obtenerDescarga = async (id)=>{
  try {
    const url1 = `https://graph.facebook.com/v21.0/${id}`;
    const respuestaUrl = await fetchApi(url1);
    const { url } = respuestaUrl.data;
  
    //con el enlace, tenemos listo la imagen para su descarga
    const url2 = url;
    const descarga = await fetchApi(url2, 'arraybuffer');
    return new Buffer.from( descarga.data, 'binary' );
  } catch (error) {
    const err = MensajeError('No se pudo obtener el enlace de descarga o la carga del archivo',error, false);
    return err;
  };
};

const guardarArchivo = async (descarga,telefono, id, tipo, filename) => {
  try {
    const respGuardado = await cargarArchivo(descarga, telefono, id, tipo, filename);
    return respGuardado;
  } catch (error) {
    const err = MensajeError('No se pudo obtener el enlace de descarga o la cargar del archivo',error, false);
    return err;
  };
};

module.exports = {
  guardarArchivo,
  obtenerDescarga,
  rutaDescargaArchivoRecibido,
};