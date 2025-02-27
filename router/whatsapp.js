/*
  path: api/Whatsapp
*/

const {Router} = require('express');
const router = Router();
const { VerifyToken, Whatsapp } = require('../controller/whatsapp');

router.get('/', VerifyToken);
router.post('/', Whatsapp);

module.exports = router;