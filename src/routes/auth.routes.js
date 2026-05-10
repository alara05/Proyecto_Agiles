const { Router } = require('express');
const { sql, getPool } = require('../config/db');

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { correoInstitucional } = req.body;

    if (!correoInstitucional) {
      return res.status(400).json({ mensaje: 'El correo institucional es obligatorio.' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('correo', sql.VarChar(150), correoInstitucional)
      .query(`
        SELECT TOP 1
          u.UsuarioId,
          u.Nombres,
          u.Apellidos,
          u.CorreoInstitucional,
          r.Nombre AS Rol
        FROM dbo.Usuarios u
        INNER JOIN dbo.Roles r ON r.RolId = u.RolId
        WHERE u.CorreoInstitucional = @correo
          AND u.Activo = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ mensaje: 'Usuario no autorizado.' });
    }

    return res.json({
      mensaje: 'Acceso correcto.',
      usuario: result.recordset[0]
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
