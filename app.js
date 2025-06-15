require('dotenv').config(); // 🛡️ A05: Security Misconfiguration - Uso de variables de entorno
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET, // 🛡️ A02: Cryptographic Failures - uso de secreto para sesiones
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // 🛡️ A01: Previene acceso al cookie vía JS
    secure: false, // En producción debe ser true con HTTPS 🛡️ A05
    maxAge: 1000 * 60 * 60
  }
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

app.use('/', authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
});
