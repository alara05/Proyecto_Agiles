const { Router } = require('express');
const { sql, getPool } = require('../config/db');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM dbo.vw_InventarioActivos ORDER BY FechaRegistro DESC');
    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
});

router.get('/buscar', async (req, res, next) => {
  try {
    const { texto, tipoEquipoId, laboratorioId, estadoActivoId } = req.query;
    const pool = await getPool();
    const result = await pool.request()
      .input('Texto', sql.VarChar(120), texto || null)
      .input('TipoEquipoId', sql.Int, tipoEquipoId ? Number(tipoEquipoId) : null)
      .input('LaboratorioId', sql.Int, laboratorioId ? Number(laboratorioId) : null)
      .input('EstadoActivoId', sql.Int, estadoActivoId ? Number(estadoActivoId) : null)
      .execute('dbo.usp_BuscarActivos');

    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const activo = req.body;

    if (!activo.codigoInventario || !activo.nombre || !activo.tipoEquipoId || !activo.estadoActivoId) {
      return res.status(400).json({
        mensaje: 'Codigo, nombre, tipo de equipo y estado son obligatorios.'
      });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('CodigoInventario', sql.VarChar(40), activo.codigoInventario)
      .input('Nombre', sql.VarChar(120), activo.nombre)
      .input('TipoEquipoId', sql.Int, activo.tipoEquipoId)
      .input('Marca', sql.VarChar(80), activo.marca || null)
      .input('Modelo', sql.VarChar(80), activo.modelo || null)
      .input('NumeroSerie', sql.VarChar(100), activo.numeroSerie || null)
      .input('Caracteristicas', sql.VarChar(500), activo.caracteristicas || null)
      .input('FechaCompra', sql.Date, activo.fechaCompra || null)
      .input('EstadoActivoId', sql.Int, activo.estadoActivoId)
      .input('LaboratorioActualId', sql.Int, activo.laboratorioActualId || null)
      .input('ResponsableActualId', sql.Int, activo.responsableActualId || null)
      .input('Observacion', sql.VarChar(500), activo.observacion || null)
      .execute('dbo.usp_RegistrarActivo');

    res.status(201).json({
      mensaje: 'Activo registrado correctamente.',
      activoId: result.recordset[0].ActivoId
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/asignar', async (req, res, next) => {
  try {
    const { laboratorioId, responsableId, observacion } = req.body;

    if (!laboratorioId || !responsableId) {
      return res.status(400).json({
        mensaje: 'Laboratorio y responsable son obligatorios.'
      });
    }

    const pool = await getPool();
    await pool.request()
      .input('ActivoId', sql.Int, Number(req.params.id))
      .input('LaboratorioId', sql.Int, laboratorioId)
      .input('ResponsableId', sql.Int, responsableId)
      .input('Observacion', sql.VarChar(500), observacion || null)
      .execute('dbo.usp_AsignarActivo');

    res.json({ mensaje: 'Activo asignado correctamente.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
