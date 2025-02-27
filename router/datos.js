/*
  path: api/Datos
*/

const {Router} = require('express');
const { mensajesContactos, getChat, actualizarDatosContacto } = require('../controller/datos');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');
const { validarDatoNoNulo } = require('../utils/validaciones');
const router = Router();

router.get('/mensajes', mensajesContactos);

router.post('/getChat',[
  check('telefono', 'Necesito un telefono').not().isEmpty(),
  validarCampos
], getChat);

router.post('/actualizarPaciente', [
  check('nombre', 'Necesito un Nombre de contacto').not().isEmpty(),
  check('apellido').custom(validarDatoNoNulo),
  check('empresa').custom(validarDatoNoNulo),
  check('telefono', 'Necesito un telefono').not().isEmpty(),
  check('uid', 'Necesito un identificador válido').not().isEmpty(),
], actualizarDatosContacto);

module.exports = router;