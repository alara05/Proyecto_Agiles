const { Router } = require('express');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { sql, getPool } = require('../config/db');

const router = Router();

const microsoftClient = jwksClient({
  jwksUri: `${process.env.MS_AUTHORITY || 'https://login.microsoftonline.com/consumers'}/discovery/v2.0/keys`
});

const microsoftIssuer = process.env.MS_TOKEN_ISSUER || 'https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0';

function getMicrosoftSigningKey(header, callback) {
  microsoftClient.getSigningKey(header.kid, (error, key) => {
    if (error) {
      callback(error);
      return;
    }

    callback(null, key.getPublicKey());
  });
}

function verifyMicrosoftToken(idToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getMicrosoftSigningKey,
      {
        algorithms: ['RS256'],
        audience: process.env.MS_CLIENT_ID,
        issuer: microsoftIssuer
      },
      (error, decoded) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(decoded);
      }
    );
  });
}

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

router.post('/microsoft', async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!process.env.MS_CLIENT_ID) {
      return res.status(500).json({
        mensaje: 'Falta configurar MS_CLIENT_ID en el archivo .env.'
      });
    }

    if (!idToken) {
      return res.status(400).json({ mensaje: 'No se recibio el token de Microsoft.' });
    }

    const claims = await verifyMicrosoftToken(idToken);
    const correo = claims.preferred_username || claims.email || claims.upn;
    const nombre = claims.name || correo || 'Usuario Microsoft';

    return res.json({
      mensaje: 'Acceso con Microsoft correcto.',
      usuario: {
        UsuarioId: claims.oid || claims.sub,
        Nombres: nombre,
        Apellidos: '',
        CorreoInstitucional: correo,
        Rol: 'Microsoft personal'
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        mensaje: 'La cuenta de Microsoft no pudo ser validada.',
        detalle: error.message
      });
    }

    return next(error);
  }
});

module.exports = router;
