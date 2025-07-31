const authMiddleware = (req, res, next) => {
  const token = req.headers['access_token'];

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }
  if (isNaN(token)) {
    return res.status(403).json({ error: 'Invalid access token' });
  }
  req.userId = token;

  next(); // move to next middleware or controller
};

module.exports = authMiddleware;
