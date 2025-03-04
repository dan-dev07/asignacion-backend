const esSoloNumero = (cadena) => {
  const regex = /^[0-9]+$/;
  if (regex.test(cadena)) return true;
  else return false;
};

module.exports = {
  esSoloNumero
};
