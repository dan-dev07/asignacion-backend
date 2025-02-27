

const newFecha = () => {
  // Obtener la fecha actual
  const now = new Date();
  // Configurar el formateador para la zona horaria del centro de México
  const options = {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // Para usar el formato de 24 horas
  };
  // Formatear la fecha y hora
  const formatter = new Intl.DateTimeFormat('es-MX', options);
  const formattedDate = formatter.format(now);
  return formattedDate;
};

module.exports = {
  newFecha
}