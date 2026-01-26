// knexfile.js
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  development: {
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',   
      port: 3306,
      user: 'root',
      password: '',      
      database: 'gym_db'   
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
