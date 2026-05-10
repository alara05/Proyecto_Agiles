const { Router } = require('express');
const { getPool } = require('../config/db');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const pool = await getPool();
    const [tiposEquipo, estadosActivo, laboratorios, responsables] = await Promise.all([
      pool.request().query('SELECT TipoEquipoId, Nombre FROM dbo.TiposEquipo WHERE Activo = 1 ORDER BY Nombre'),
      pool.request().query('SELECT EstadoActivoId, Nombre FROM dbo.EstadosActivo WHERE Activo = 1 ORDER BY EstadoActivoId'),
      pool.request().query('SELECT LaboratorioId, Codigo, Nombre FROM dbo.Laboratorios WHERE Activo = 1 ORDER BY Nombre'),
      pool.request().query('SELECT ResponsableId, Nombres, Apellidos, Correo FROM dbo.Responsables WHERE Activo = 1 ORDER BY Apellidos')
    ]);

    res.json({
      tiposEquipo: tiposEquipo.recordset,
      estadosActivo: estadosActivo.recordset,
      laboratorios: laboratorios.recordset,
      responsables: responsables.recordset
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
