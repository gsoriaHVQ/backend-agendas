// app.js
require('dotenv').config();
const express = require('express');
const getConnection = require('./db/connect');

const app = express();
app.use(express.json());

// Ruta de prueba de vida
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
//get all medicos
app.get('/medicos', async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT DISTINCT
         pr.CD_PRESTADOR,
         pr.NM_PRESTADOR,
         pr.NM_MNEMONICO,
         ia.CD_ITEM_AGENDAMENTO,
         ia.DS_ITEM_AGENDAMENTO
       FROM DBAMV.AGENDA_CENTRAL ac
       JOIN DBAMV.PRESTADOR pr ON pr.CD_PRESTADOR = ac.CD_PRESTADOR
       JOIN DBAMV.AGENDA_CENTRAL_ITEM_AGENDA acia ON acia.CD_AGENDA_CENTRAL = ac.CD_AGENDA_CENTRAL
       JOIN DBAMV.ITEM_AGENDAMENTO ia ON ia.CD_ITEM_AGENDAMENTO = acia.CD_ITEM_AGENDAMENTO
       WHERE pr.TP_SITUACAO = 'A'
         AND ia.SN_ATIVO = 'S'`
    );

    const data = result.rows.map(row => ({
      codigo_prestador: row[0],
      nombre_prestador: row[1],
      mnemonico: row[2],
      codigo_item_agendamiento: row[3],
      descripcion_item: row[4]
    }));

    await connection.close();

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Grupo de rutas /medicos
app.get('/medicos/especialidad/:especialidad', async (req, res) => {
  const { especialidad } = req.params;
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT DISTINCT
         pr.CD_PRESTADOR,
         pr.NM_PRESTADOR,
         pr.NM_MNEMONICO,
         ia.CD_ITEM_AGENDAMENTO,
         ia.DS_ITEM_AGENDAMENTO
       FROM DBAMV.AGENDA_CENTRAL ac
       JOIN DBAMV.PRESTADOR pr ON pr.CD_PRESTADOR = ac.CD_PRESTADOR
       JOIN DBAMV.AGENDA_CENTRAL_ITEM_AGENDA acia ON acia.CD_AGENDA_CENTRAL = ac.CD_AGENDA_CENTRAL
       JOIN DBAMV.ITEM_AGENDAMENTO ia ON ia.CD_ITEM_AGENDAMENTO = acia.CD_ITEM_AGENDAMENTO
       WHERE pr.TP_SITUACAO = 'A'
         AND ia.SN_ATIVO = 'S'
         AND ia.DS_ITEM_AGENDAMENTO LIKE :especialidad`,
      [ `%${especialidad}%` ]
    );

    const data = result.rows.map(row => ({
      codigo_prestador: row[0],
      nombre_prestador: row[1],
      mnemonico: row[2],
      codigo_item_agendamiento: row[3],
      descripcion_item: row[4]
    }));

    await connection.close();

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/medicos/item/:codigo_item', async (req, res) => {
  const { codigo_item } = req.params;
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT DISTINCT
         pr.CD_PRESTADOR,
         pr.NM_PRESTADOR,
         pr.NM_MNEMONICO,
         ia.CD_ITEM_AGENDAMENTO,
         ia.DS_ITEM_AGENDAMENTO
       FROM DBAMV.AGENDA_CENTRAL ac
       JOIN DBAMV.PRESTADOR pr ON pr.CD_PRESTADOR = ac.CD_PRESTADOR
       JOIN DBAMV.AGENDA_CENTRAL_ITEM_AGENDA acia ON acia.CD_AGENDA_CENTRAL = ac.CD_AGENDA_CENTRAL
       JOIN DBAMV.ITEM_AGENDAMENTO ia ON ia.CD_ITEM_AGENDAMENTO = acia.CD_ITEM_AGENDAMENTO
       WHERE pr.TP_SITUACAO = 'A'
         AND ia.SN_ATIVO = 'S'
         AND ia.CD_ITEM_AGENDAMENTO = :codigo_item`,
      [ codigo_item ]
    );

    const data = result.rows.map(row => ({
      codigo_prestador: row[0],
      nombre_prestador: row[1],
      mnemonico: row[2],
      codigo_item_agendamiento: row[3],
      descripcion_item: row[4]
    }));

    await connection.close();

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/medicos/nombre/:nombre', async (req, res) => {
  const { nombre } = req.params;
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT DISTINCT
         pr.CD_PRESTADOR,
         pr.NM_PRESTADOR,
         pr.NM_MNEMONICO,
         ia.CD_ITEM_AGENDAMENTO,
         ia.DS_ITEM_AGENDAMENTO
       FROM DBAMV.AGENDA_CENTRAL ac
       JOIN DBAMV.PRESTADOR pr ON pr.CD_PRESTADOR = ac.CD_PRESTADOR
       JOIN DBAMV.AGENDA_CENTRAL_ITEM_AGENDA acia ON acia.CD_AGENDA_CENTRAL = ac.CD_AGENDA_CENTRAL
       JOIN DBAMV.ITEM_AGENDAMENTO ia ON ia.CD_ITEM_AGENDAMENTO = acia.CD_ITEM_AGENDAMENTO
       WHERE pr.TP_SITUACAO = 'A'
         AND ia.SN_ATIVO = 'S'
         AND LOWER(pr.NM_PRESTADOR) LIKE :nombre`,
      [ `%${nombre.toLowerCase()}%` ]
    );

    const data = result.rows.map(row => ({
      codigo_prestador: row[0],
      nombre_prestador: row[1],
      mnemonico: row[2],
      codigo_item_agendamiento: row[3],
      descripcion_item: row[4]
    }));

    await connection.close();

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

module.exports = app;
