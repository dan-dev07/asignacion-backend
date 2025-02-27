const express = require("express");
const multer = require('multer');
const { descargarArchivo } = require("../utils/archivosExterno");
const { MensajeError } = require("../utils/error");

const entregarArchivoBuffer = async (req, res = express.response) => {
  try {
    const { urlDocumento, tipo } = req.body;
    console.log(req.body);
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

module.exports = {
  entregarArchivoBuffer,
};