const {response} = require('express')
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const { generarJWT, comprobarJWT } = require('../utils/jwt');

const ingresar = async (req, res = response) => {
  try {
    const { email, password } = req.body;
    const usuarioDB = await Usuario.findOne({ email });
    if (!usuarioDB) {
      return res.status(400).send('Revisa tus credenciales');
    };
    
    const validarPassword = bcrypt.compareSync(password, usuarioDB.password);
    if (!validarPassword) {
      return res.status(400).send("Revisa tus credenciales");
    };
    const token = await generarJWT(usuarioDB);

    res.json({
      token
    });
  } catch (error) {
    res.status(500).send('Hable con el administrador');
  };
};

//Renovar token
const nuevoToken = async (req, res = response) => {
  try {
    const t = req.body;
    const [bool, usuario] = comprobarJWT(t.token);
    const token = await generarJWT(usuario);
    res.json({
      token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      response: "No se encontró al usuario",
    });
  };
};

module.exports = {
  ingresar,
  nuevoToken,
};