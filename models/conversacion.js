const { Schema, model } = require('mongoose');

const ConversacionSchema = new Schema({
  datosExterno:{
    nombre:{
      type:String,
      required:false,
      trim:true
    },
    apellido:{
      type:String,
      required:false,
      trim:true
    },
    empresa:{
      type:String,
      required:false,
      trim:true
    },
  },
  telefono: {
    type: String,
    required: false,
    unique: true
  },
  uid: {
    type: String,
    require: true,
    unique: true
  },
  usuarioAsignado: {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    uid: {
      type: String,
      required: true,
    }
  },
  ultimaComunicacion: {
    type: Date,
    required: false,
  },
  chats:
    [{
      fecha: {
        type: String,
        required: true
      },
      emisor: {
        type: String,
        required: true,
      },
      tipo: {
        type: String,
        required: true
      },
      urlDocumento: {
        type: String,
        required: false,
      },
      filename: {
        type: String,
        required: false
      },
      mensaje: {
        type: String,
        required: true,
        trim: true
      },
      mensajeId: {
        type: String,
        required: true,
        trim: true
      },
      leido: {
        type: Boolean,
        required: false
      },
      caption:{
        type:String,
        required:false,
        trim:true
      },
      context:{
        message_id:{
          type:String,
          required:false,
          trim:true
        },
        from:{
          type:String,
          required:false,
          trim:true,
        },
        id:{
          type:String,
          required:false,
          trim:true
        }
      },
    }]
});

ConversacionSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});
module.exports = model('Conversaciones', ConversacionSchema); 