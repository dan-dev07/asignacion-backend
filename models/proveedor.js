const { Schema, model } = require('mongoose');

const ExternoSchema = Schema({
  datosExterno: {
    nombre: {
      type: String,
      required: false,
      trim: true
    },
    apellido: {
      type: String,
      required: false,
      trim: true
    },
    empresa: {
      type: String,
      required: false,
      trim: true
    },
  },
  telefono: {
    type: String,
    required: true,
    unique: true,
  },
  uid: {
    type: String,
    require: true,
    unique: true,
  },
  ultimaComunicacion:{
    type:String,
    require:false,
  },
  mensajes:[
    {
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
      caption: {
        type: String,
        required: false,
        trim: true
      },
      context: {
        message_id: {
          type: String,
          required: false,
          trim: true
        },
        from: {
          type: String,
          required: false,
          trim: true,
        },
        id: {
          type: String,
          required: false,
          trim: true
        }
      },
    }]
});
ExternoSchema.method('toJSON', function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('Externo', ExternoSchema); 