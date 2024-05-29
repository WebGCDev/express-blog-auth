const jwt = require('jsonwebtoken');
require('dotenv').config();
const users = require('../db/users.json');

// Il token è restituito con le virgolette: Trovare una soluzione
const generateToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1m' });

const authenticateWithJWT = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res
      .status(401)
      .send('Hai bisogno di autenticarti.Procedi con il Login');
  }

  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send('Token non valido.');
    }
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  const { username } = req.user || {};
  const user = users.find((u) => u.username === username);
  if (!user || user.admin !== true) {
    // Fixed admin check
    return res
      .status(403)
      .send('Non sei autorizzato, devi essere admin! Sarebbe troppo facile!');
  }
  next();
};

const login = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(404).send('Credenziali errate.');
  }
  // Il token è restituito con le virgolette: Trovare una soluzione
  const token = generateToken({ username, admin: user.admin });
  res.json(token);
};

module.exports = {
  generateToken,
  authenticateWithJWT,
  isAdmin,
  login,
};
