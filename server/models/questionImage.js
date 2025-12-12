const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('QuestionImage', {
    documentId: { type: DataTypes.INTEGER, allowNull: false },
    questionId: { type: DataTypes.INTEGER },
    pageNum: { type: DataTypes.INTEGER },
    gcsUri: { type: DataTypes.STRING },
    caption: { type: DataTypes.STRING }
  }, { tableName: 'question_images' });
};
