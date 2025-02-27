const MensajeError =(msg, error, ok=false)=>{
  console.log(msg, error, ok);
  return {
    msg,
    error,
    ok
  };
};

module.exports = {
  MensajeError,
};