const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

// Vista registro
router.get('/register', (req, res) => res.render('register'));

// Vista login
router.get('/login', (req, res) => res.render('login'));

// Vista perfil
router.get('/profile', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const user = await User.findById(req.session.userId).select('-passwordHash');
  res.render('profile', { user });
});

// POST: Registro
router.post('/register', [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isStrongPassword()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).send("Error en los datos");

  const { username, email, password } = req.body;

  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).send("Usuario ya registrado");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({ username, email, passwordHash });
    await user.save();

    res.redirect('/login');
  } catch (err) {
    res.status(500).send("Error en el servidor");
  }
});

// POST: Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).send("Credenciales inválidas");

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).send("Credenciales inválidas");

  req.session.userId = user._id;
  res.redirect('/profile');
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
