// sequelize cli não consegue ler como imports
require('dotenv').config();

module.exports = {
  dialect: 'postgres',
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
    charset: 'utf8',
  },
};
