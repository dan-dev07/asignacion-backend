/*
  path: api/Usuarios
*/

const {Router} = require('express');
const router = Router();
const { obtenerUsuarios, actulizarEstado, actualizarUsuario, crearUsario, operadorUsuario } = require('../controller/usuario');
const { check } = require('express-validator');
const { validarCampos, validarPassword } = require('../middlewares/validarCampos');

router.get('/', obtenerUsuarios);
router.get('/obtenerOperador', operadorUsuario);

router.post('/Agregar', [
  check('nombre', 'El usuario es obligatorio').not().isEmpty(),
  check('password', 'La contraseña es obligatorio').not().isEmpty(),
  check('email', 'Necesito un correo válido').isEmail(),
  check('rol', 'Necesito un puesto válido para este usuario').not().isEmpty(),
  validarCampos
],crearUsario);

router.post('/actualizarUsuario',[
  check('nombre', 'El usuario es obligatorio').not().isEmpty(),
  check('password').custom(validarPassword),
  check('email', 'Necesito un correo válido').isEmail(),
  check('rol', 'Necesito un puesto válido para este usuario').not().isEmpty().isArray({min:1, max:3}),
  check('activo', 'Necesito un puesto válido para este usuario').not().isEmpty().isBoolean(),
  check('uid', 'Necesito un puesto válido para este usuario').not().isEmpty(),
  validarCampos
],actualizarUsuario);

router.post('/actualizarEstado', [
  check('uid', 'Necesito un identificador válido').not().isEmpty(),
  check('activo', 'Necesito el estado actual del usuario').not().isEmpty(),
  validarCampos
], actulizarEstado);

module.exports = router;