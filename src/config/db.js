const sql = require('mssql/msnodesqlv8');
require('dotenv').config({ quiet: true });

const hasSqlLogin = Boolean(process.env.DB_USER && process.env.DB_PASSWORD);

const server = process.env.DB_SERVER || 'localhost';
const database = process.env.DB_DATABASE || 'SistemaActivosFISEI';
const encrypt = process.env.DB_ENCRYPT === 'true' ? 'Yes' : 'No';
const trustServerCertificate = process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false' ? 'Yes' : 'No';
let config;

if (hasSqlLogin) {
  config = {
    connectionString: [
      'Driver={ODBC Driver 18 for SQL Server}',
      `Server=${server}`,
      `Database=${database}`,
      `UID=${process.env.DB_USER}`,
      `PWD=${process.env.DB_PASSWORD}`,
      `Encrypt=${encrypt}`,
      `TrustServerCertificate=${trustServerCertificate}`
    ].join(';')
  };
} else {
  config = {
    connectionString: [
      'Driver={ODBC Driver 18 for SQL Server}',
      `Server=${server}`,
      `Database=${database}`,
      'Trusted_Connection=Yes',
      `Encrypt=${encrypt}`,
      `TrustServerCertificate=${trustServerCertificate}`
    ].join(';')
  };
}

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }

  return poolPromise;
}

module.exports = {
  sql,
  getPool
};
