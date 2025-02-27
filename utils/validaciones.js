const validarPassword = value => {
  // Permitir cadena vacía o al menos 5 caracteres
  if (value === '' || value.length >= 1) {
    return true;
  };
  return false;
};

const validarDatoNoNulo = value => {
  // Permitir cadena vacía o al menos 5 caracteres
  if (value === '' || value.length >= 1) {
    return true;
  };
  return false;
};

module.exports = {
  validarPassword,
  validarDatoNoNulo,
};