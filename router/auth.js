/*
  path: api/Login
*/

const {Router} = require('express');
const router = Router();
const {ingresar, nuevoToken} = require('../controller/auth');
const {check} = require('express-validator');

router.post('/',ingresar);

router.post('/Refresh',
  check('token', 'El token es obligatorio').not().isEmpty(),
  nuevoToken);

module.exports = router;