const sessionAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    next(); 
  } else {
    return res.status(401).json({ error: 'Unauthorized: Please log in' });
  }
};

module.exports = sessionAuth;
