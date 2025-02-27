const numeroTelefono = (number) => {
  let newNumber = '';
  if (number.length === 13 && number.startsWith('521')) {
    newNumber = '52' + number.slice(3, 13);
  };
  return newNumber;
};

module.exports = {
  numeroTelefono
};