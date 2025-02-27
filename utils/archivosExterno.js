const { BlobServiceClient } = require('@azure/storage-blob');
const stream = require('stream');
const {v4:uuidv4} = require('uuid');
const { MensajeError } = require('./error');

// Configura tu conexión a Azure Blob Storage
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_CONNECTION_STRING;

// Nombre del contenedor y del blob
const containerName = 'data';

const cargarArchivo =async(buffer, telefono, id, tipo, filename)=>{
  
  try {
    const idUuid = uuidv4();//Generar un id aleatorio para cada archivo al guardar
    let blobName;
    if (tipo === 'image') {
      blobName = `${telefono}/${idUuid}.jpg`;
    }else if (tipo === 'document') {
      blobName = `${telefono}/${filename}`;
    }else if(tipo === 'audio'){
      blobName = `${telefono}/${idUuid}.wav`
    }else if (tipo === 'video') {
      blobName = `${telefono}/${idUuid}.mp4`
    }
    // Crear un cliente de servicio de blob
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  
    // Obtener un cliente de contenedor
    const containerClient = blobServiceClient.getContainerClient(containerName);
  
    // Crear el contenedor si no existe
    await containerClient.createIfNotExists();
  
    // Obtener un cliente de blob
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
    // Subir el blob
    await blockBlobClient.uploadData(buffer);
    // console.log(`El archivo se ha subido a ${blobName} en el contenedor ${containerName}`);
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
    const err = MensajeError('Erroro al descargar el blob', error, false)
    return err;
  };
};

module.exports = {
  cargarArchivo,
  descargarArchivo
};