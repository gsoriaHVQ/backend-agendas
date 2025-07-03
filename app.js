// app.js
require('dotenv').config();
const express = require('express');
const getConnection = require('./db/connect');

const app = express();
app.use(express.json());

app.use('/agendas', require('./routes/agendas'));
app.use('/medicos', require('./routes/medicos'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});

router.get('/especialidad/:especialidad', getMedicosByEspecialidad);
router.get('/item/:codigo_item', getMedicosByCodigoItem);
router.get('/nombre/:nombre', getMedicosByNombre);
