const connection = {
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mehut',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
};

const pool = {
  min: 1,
  max: 5
};

const knex = {
  client: process.env.DB_CLIENT || 'postgresql',
  connection,
  pool,
  migrations: {
    tableName: 'migration',
    stub: 'migrations/template.js'
  }
};

module.exports = {
  development: knex,
  staging: knex,
  production: knex,
  pg: Object.assign({}, pool, connection),
  defaultSchema: process.env.DB_DEFAULT_SCHEMA || 'walless',
  cdn: 'https://walless-upload.ams3.digitaloceanspaces.com'
};
