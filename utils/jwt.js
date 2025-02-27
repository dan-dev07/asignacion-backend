const jwt = require('jsonwebtoken');
const { MensajeError } = require('./error');

const generarJWT = async (usuario) => {
  return new Promise((resolve, reject) => {
    // const {nombre, email, uid, rol} = usuario
    const { nombre, uid, rol } = usuario
    // const payload = {nombre, email, uid, rol};
    const payload = { nombre, uid, rol };
    jwt.sign(payload, process.env.JWT_KEY, {
      expiresIn: '12h'
    }, (err, token) => {
      if (err) {
        reject('No se pudo generar el jwt');
      } else {
        resolve(token);
      };
    });
  });
};

const comprobarJWT = (token = '') => {
  try {
    const { nombre, uid, rol } = jwt.verify(token, process.env.JWT_KEY);
    return [true, { nombre, uid, rol }];
  } catch (error) {
    return [false, null];
  };
};

const validarJWT = (req, res, next) => {
  try {
    const token = req.header('x-token');
    if (!token) {
      const err = MensajeError('No hay token en la petición', null, false);
      return res.status(401).json(err);
    };

    const { uid } = jwt.verify(token, process.env.JWT_KEY);
    req.uid = uid;
    next();
  } catch (error) {
    const err = MensajeError('El token no es válido', error, false);
    return res.status(404).json(err);
  };
};

module.exports = {
  generarJWT,
  comprobarJWT,
  validarJWT
};