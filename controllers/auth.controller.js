const authService = require('../service/auth.service');

const signin = async (req, res) => {
  try {
    const { id, password } = req.body;
    const result = await authService.signin(id, password);
    res.json(result);
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const renewToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.renewToken(refreshToken);
    res.json(result);
  } catch (error) {
    console.error('Error during token renewal:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const signup = async (req, res) => {
  try {
    const { id, password } = req.body;
    const result = await authService.signup(id, password);
    res.json(result);
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getInfo = (req, res) => {
  res.json({ id: req.user });
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    await authService.deactivateToken(refreshToken);

    res.sendStatus(204);
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  signin,
  renewToken,
  signup,
  getInfo,
  logout,
};
