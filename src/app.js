require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const routes = require('./routes/index');
app.use('/', routes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '¡API funcionando!' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});