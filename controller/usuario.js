const {response} = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');

const obtenerUsuarios = async (req, res = response) => {
  try {
    const users = await Usuario.find();
    const usuarios = users.map(u => {
      const { email, nombre, rol, uid, activo } = u;
      return { email, nombre, rol, uid, activo };
    })
    res.send(usuarios);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al guardar los datos'
    });
  };
};

const actulizarEstado = async (req, res = response) => {
  try {
    const {uid, activo, userUid} = req.body;
    const usuarioActual = await Usuario.findOne({uid: userUid});
    console.log(usuarioActual);
    
    if (!usuarioActual.rol.includes("Admin")) {
      return res.json({
        ok:false,
        response:'No autorizado'
      });
    };

    const act = await Usuario.findOneAndUpdate({ uid }, {activo}, {new:true});
    if (act) {
      return res.json({
        ok:true,
        activo:act.activo
      });
    };
    return res.json({
      ok:false,
      activo:act.activo
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'No se pudo actualizar el estado del usuario'
    });
  };
};

const actualizarUsuario =async (req, res = response) => {
  try {
    const {nombre, password, email, rol, activo, uid, userUid} = req.body;
    const usuarioActual = await Usuario.findOne({uid: userUid});
    if (!usuarioActual.rol.includes("Admin")) {
      return res.json({
        response:'No autorizado'
      });
    };
    
    //usuario actual sin cambios
    const usuario = await Usuario.findOne({uid});
    usuario.nombre = nombre;
    usuario.email = email;
    usuario.rol = rol;
    usuario.activo = activo;
    usuario.uid= uid;
    if (password !== '' && password !== null) {
      //Encriptar contraseña
      const salt = bcrypt.genSaltSync(5);
      usuario.password = bcrypt.hashSync(password, salt);
    };

    //Actualizar usuario
    const actUsuario = await Usuario.findOneAndUpdate({uid}, usuario, {new:true});
    if (actUsuario) {
      return res.json({
        actualizado:true,
        nombre:actUsuario.nombre
      });
    };
    return res.json({
      actualizado:false,
    });
  } catch (error) {
    res.status(500).json({
      response: "No se actualizó el usuario",
    });
  };
};

const crearUsario = async (req, res = response) => {
  try {
    const { email, password, userUid } = req.body;
    const usuarioActual = await Usuario.findOne({uid: userUid});
    if (!usuarioActual.rol.includes("Admin")) {
      return res.send({
        ok: false,
        response:'No autorizado'
      });
    };
    const existeEmail = await Usuario.findOne({ email });
    if (existeEmail) {
      return res.send({
        ok: false,
        response: 'El correo ya existe',
      });
    };
    req.body.activo = true;
    req.body.uid = uuidv4();
    const usuario = new Usuario(req.body);
    const salt = bcrypt.genSaltSync(5);
    usuario.password = bcrypt.hashSync(password, salt);
    await usuario.save();

    res.send('Usuario creado');
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al crear nuevo usuario'
    });
  };
};

const operadorUsuario = async (req, res = response)=>{
  try {
    const usuarios = await Usuario.find();
    const operador = usuarios.filter(a => (a.rol.includes("Operador")) && (a.activo === true));
    let aux = operador.map(o => {
      return {
        value: o.uid,
        label: o.nombre,
        // uid: o.uid
      }
    });
    res.send(aux);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: 'Hubo un error al crear nuevo usuario'
    });
  };
};

module.exports = {
  obtenerUsuarios,
  actulizarEstado,
  actualizarUsuario,
  crearUsario,
  operadorUsuario,
}