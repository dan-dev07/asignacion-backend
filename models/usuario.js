const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
  nombre: {
    type:String,
    required: true,
    trim:true
  },
  email:{
    type:String,
    required:true,
    unique:true,
    trim:true
  },
  password:{
    type:String,
    required:true,
    trim:true
  },
  rol:[{
    type:String,
    required:true,
    trim:true
  }],
  activo:{
    type:Boolean,
    require:true,
  },
  uid:{
    type:String,
    require:true,
    unique:true,
  }
});

UsuarioSchema.method('toJSON', function () {
  const {__v, _id, password , ...object} = this.toObject();
  object.id = _id;
  return object;
});

module.exports = model('Usuario', UsuarioSchema); 