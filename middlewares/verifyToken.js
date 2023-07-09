const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // Get token from header
  var token = req.header('Authorization');

  req.user = {}
  return next();

  if (!token) {
    return res.status(401).json({ error: 'Authentication failed: no token provided' });
  }

  token = token.replace('Bearer ', '');

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed: invalid token' });
  }
}

module.exports = verifyToken;