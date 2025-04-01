

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

// Función para convertir la fecha en un objeto Date
const parseFecha = (fechaStr) => {
  const [fecha, hora] = fechaStr.split(', ');
  const [dia, mes, anio] = fecha.split('/');
  const [horaStr, minutoStr, segundoStr] = hora.split(':');
  return new Date(anio, mes - 1, dia, horaStr, minutoStr, segundoStr);
};

module.exports = {
  newFecha,
  parseFecha
};