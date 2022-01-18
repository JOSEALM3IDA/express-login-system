const Pool = require("pg").Pool;

export const pool = new Pool({
    user: "user",
    password: "password",
    database: "express-login-db",
    host: "localhost",
    port: 5432
});
