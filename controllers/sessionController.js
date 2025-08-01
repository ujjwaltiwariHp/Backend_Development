
const getDashboard = (req, res) => {
  res.json({
    message: `Welcome ${req.session.user.username}`,
    session: req.session.user
  });
};

module.exports = { getDashboard };
