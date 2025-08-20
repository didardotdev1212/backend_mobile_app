const knex = require("knex")({
  client: "pg",
  connection: {
    host: process.env.PG_HOST,
    port: 5432,
    user: "neondb_owner",
    password: process.env.PG_PASSWORD,
    database: "neondb",
    ssl: {
      rejectUnauthorized: false,
      require: false,
    },
  },
  searchPath: ["knex", "public"],
});

export default knex;
