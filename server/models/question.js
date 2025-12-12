const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Question', {
    documentId: { type: DataTypes.INTEGER, allowNull: false },
    pageNum: { type: DataTypes.INTEGER },
    questionText: { type: DataTypes.TEXT },
    answerText: { type: DataTypes.TEXT },
    marks: { type: DataTypes.INTEGER },
    qtype: { type: DataTypes.STRING }, // MCQ, Short, Long, Diagram
    bbox: { type: DataTypes.JSON } // { left, top, width, height } - optional
  }, { tableName: 'questions' });
};
