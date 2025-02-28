const stream = require('stream');
const path = require('path');
const fs = require('fs');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const { MensajeError } = require('./error');

// Configura tu conexión a Azure Blob Storage
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_CONNECTION_STRING;

// Nombre del contenedor y del blob
const containerName = 'data';

const cargarArchivo = async (filename, mimetype, telefono) => {
  const ruta = path.join(__dirname, '\/\.\./controller/uploads', filename);
  
  try {
    const id = uuidv4();
    let blobName;
    const ext = filename.split('.').reverse()[0];

    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
      blobName = `${telefono}/${id}.jpg`;
    } else {
      blobName = `${telefono}/${filename}`;
    };
    // Crear un cliente de servicio de blob
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    // Obtener un cliente de contenedor
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Crear el contenedor si no existe
    await containerClient.createIfNotExists();

    // Obtener un cliente de blob
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    //buffer
    const streamBuffer = fs.readFileSync(ruta);

    // Subir el blob
    await blockBlobClient.uploadData(streamBuffer, streamBuffer.length, {
      blobHTTPHeaders:{
        blobContentType: mimetype
      }
    });
    // console.log(`El archivo se ha subido a ${blobName} en el contenedor ${containerName}`);
    fs.unlinkSync(ruta);
    // Cargar el buffer en Azure Blob Storage
    return blobName;

  } catch (error) {
    return MensajeError('Error al cargar el blob:', error, false);
  };
};

const descargarArchivo = async (blobName) => {
  try {
    // Crear un cliente de servicio de blob
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    // Obtener un cliente de contenedor
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Obtener un cliente de blob
    const blockBlobClient = containerClient.getBlobClient(blobName);

    // Descargar el blob
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    // Pipe el stream de lectura del blob al stream de escritura
    const bufferStream = new stream.PassThrough();
    return downloadBlockBlobResponse.readableStreamBody.pipe(bufferStream);

  } catch (error) {
    return MensajeError('Error al descargar el blob:', error, false);
  };
};

module.exports = {
  cargarArchivo,
  descargarArchivo,
}