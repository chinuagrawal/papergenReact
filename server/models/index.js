// models/index.js
const { Sequelize } = require('sequelize');
const path = require('path');

const pgConn = process.env.PG_CONNECTION || process.env.DATABASE_URL || null;

let sequelize;
if (pgConn) {
  // Use the provided PG connection string
  sequelize = new Sequelize(pgConn, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // REQUIRED for Neon
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

} else {
  // DEV fallback: sqlite - no external DB required
  const storagePath = path.join(process.cwd(), 'dev-data.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
  });
}

// load models (adjust relative paths to your files)
const Document = require('./document')(sequelize);
const Question = require('./question')(sequelize);
const QuestionImage = require('./questionImage')(sequelize);

// associations
Document.hasMany(Question, { foreignKey: 'documentId' });
Question.belongsTo(Document, { foreignKey: 'documentId' });

Question.hasMany(QuestionImage, { foreignKey: 'questionId' });
QuestionImage.belongsTo(Question, { foreignKey: 'questionId' });

Document.hasMany(QuestionImage, { foreignKey: 'documentId' });

module.exports = { sequelize, Document, Question, QuestionImage };
