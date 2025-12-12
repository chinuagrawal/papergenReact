// server/models/document.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Document', {
    filename: { type: DataTypes.STRING, allowNull: false },
    mimeType: { type: DataTypes.STRING },
    gcsUri: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'uploaded' } // uploaded/processing/done/failed
  }, {
    tableName: 'documents',
    timestamps: true
  });
};
