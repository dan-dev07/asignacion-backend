const express = require("express");
const multer = require('multer');
const { descargarArchivo } = require("../utils/archivosExterno");
const { MensajeError } = require("../utils/error");
const { cargarArchivo } = require("../utils/archivosEscotel");
const { SampleImage, SampleDocument } = require("../utils/textTypes");
const { SetFileWhatsApp, SendFileWhatsApp } = require("./whatsapp");
const { guardarArchivoEnviado } = require("./proveedor");

const entregarArchivoBuffer = async (req, res = express.response) => {
  try {
    const { urlDocumento, tipo } = req.body;
    if (tipo === 'image' || tipo === 'document' || tipo === 'audio' || tipo === 'video') {
      const bufferStream = await descargarArchivo(urlDocumento);
      if (bufferStream) {
        // Almacenar los datos en un buffer
        const chunks = [];
        bufferStream.on('data', (chunk) => {
          chunks.push(chunk);
        });
        bufferStream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const base64 = buffer.toString('base64');
          if (tipo === 'image') {
            const dataUrl = `data:image/jpeg;base64,${base64}`; // Cambia 'image/jpeg' si es necesario
            res.json({ file: dataUrl });
          };
          if (tipo === 'document') {
            const dataUrl = `${base64}`; // Tipo MIME para PDF
            res.json({ file: dataUrl });
          };
          if (tipo === 'audio') {
            const dataUrl = `data:audio/wav;base64,${base64}`; // Cambia 'image/jpeg' si es necesario
            res.json({ file: dataUrl });
          }
          if (tipo === 'video') {
            const dataUrl = `data:video/mp4;base64,${base64}`; // Cambia 'image/jpeg' si es necesario
            res.json({ file: dataUrl });
          }
        });

        bufferStream.on('error', (error) => {
          const err = MensajeError('Error al crear el stream de datos', error, false);
          res.status(500).send('Error al crear el stream de datos');
        });
      };
    };

  } catch (error) {
    res.status(500).json({
      response: 'Hubo un error al regresar la descarga'
    });
  }
};

// Configura multer para guardar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'controller/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const enviarArchivo = async (req, data, telefono, rutaBlobname, text, filename) => {
  try {
    const mensaje = await SendFileWhatsApp(data);
    const res = await guardarArchivoEnviado(telefono, mensaje, rutaBlobname, text, filename);
    if (res.ok) {
      //si el archivo se guarda correctamente, enviar el mensaje 
      req.io.emit('archivo-enviado', ({ultimo:res.ultimo, telefono}));
    }else{
      req.io.emit('archivo-enviado', ({ultimo:res.error, telefono}));
    };
  } catch (error) {
    const err = MensajeError('Error al enviar el archivo a Whatsapp');
    return err;
  };
};

const subirArchivo = async (req, res = express.response) => {
  try {
    const { filename, mimetype } = req.file;
    const { telefono } = req.body;
    const { id } = await SetFileWhatsApp(filename, mimetype);
    const rutaBlobname = await cargarArchivo(filename, mimetype, telefono);
    if (mimetype.includes("image")) {
      const data = SampleImage(telefono, id);
      await enviarArchivo(req, data, telefono, rutaBlobname, 'image');
    } else {
      const data = SampleDocument(telefono, id, filename);
      await enviarArchivo(req, data, telefono, rutaBlobname, 'document', filename);
    };
    res.status(200).send(id);
  } catch (error) {
    res.status(500).json({
      response: 'Hubo un error al regresar la descarga'
    });
  }
};

module.exports = {
  entregarArchivoBuffer,
  upload,
  subirArchivo,
};