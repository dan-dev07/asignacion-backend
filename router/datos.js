/*
  path: api/Datos
*/

const {Router} = require('express');
const { mensajesContactos, getChat, actualizarDatosContacto, busquedaPorContacto } = require('../controller/datos');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');
const { validarDatoNoNulo } = require('../utils/validaciones');
const router = Router();

router.get('/mensajes', mensajesContactos);

router.post('/getChat',[
  check('telefono', 'Necesito un teléfono').not().isEmpty(),
  check('pagina', 'Necesito una págna').not().isEmpty(),
  check('limite', 'Necesito una cantidad').not().isEmpty(),
  validarCampos
], getChat);

router.post('/actualizarContacto', [
  check('nombre', 'Necesito un Nombre de contacto').not().isEmpty(),
  check('apellido').custom(validarDatoNoNulo),
  check('empresa').custom(validarDatoNoNulo),
  check('telefono', 'Necesito un telefono').not().isEmpty(),
  check('uid', 'Necesito un identificador válido').not().isEmpty(),
], actualizarDatosContacto);

router.post('/buscarContacto', [
  check('filtro', 'Necesito un número/nombre para empezar la búsqueda').not().isEmpty()
], busquedaPorContacto);

module.exports = router;