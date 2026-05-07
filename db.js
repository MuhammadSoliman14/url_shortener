const { Pool } = require ('pg');

const pool = new Pool({
    user: 'soliman',
    host: '127.0.0.1',
    database: 'urlshortener',
    password: '1234',
    port: 5432,
});

module.exports = pool;