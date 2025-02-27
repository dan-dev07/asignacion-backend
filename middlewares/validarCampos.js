const { validationResult } = require("express-validator");
const { MensajeError } = require("../utils/error");

const validarCampos =(req, res, next)=>{
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const err = MensajeError(null, errores.mapped(), false)
    return res.status(400).json(err);
  };
  next();
};

const validarPassword = value => {
  if (value === '' || value.length >= 1) {
    return true;
  };
  return false;
};

module.exports = {
  validarCampos,
  validarPassword
};