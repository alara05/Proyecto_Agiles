const express = require('express');
const cors = require('cors');
require('dotenv').config({ quiet: true });

const activosRoutes = require('./routes/activos.routes');
const catalogosRoutes = require('./routes/catalogos.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Sistema Activos FISEI',
    rutas: ['/api/auth/login', '/api/activos', '/api/catalogos']
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/activos', activosRoutes);
app.use('/api/catalogos', catalogosRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    mensaje: 'Error interno del servidor',
    detalle: err.message
  });
});

app.listen(port, () => {
  console.log(`API ejecutandose en http://localhost:${port}`);
});
