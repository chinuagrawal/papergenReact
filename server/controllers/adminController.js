const { Document, Question, QuestionImage } = require('../models');

exports.listDocuments = async (req, res) => {
  const docs = await Document.findAll({ order: [['createdAt','DESC']] });
  return res.json(docs);
};

exports.getDocument = async (req, res) => {
  const id = req.params.id;
  const doc = await Document.findByPk(id, { include: [Question, QuestionImage] });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  return res.json(doc);
};

exports.updateQuestion = async (req, res) => {
  const id = req.params.id;
  const { questionText, answerText, marks, qtype } = req.body;
  const q = await Question.findByPk(id);
  if (!q) return res.status(404).json({ error: 'Question not found' });
  await q.update({ questionText, answerText, marks, qtype });
  return res.json(q);
};

exports.deleteQuestion = async (req, res) => {
  const id = req.params.id;
  const q = await Question.findByPk(id);
  if (!q) return res.status(404).json({ error: 'Question not found' });
  await q.destroy();
  return res.json({ success: true });
};

exports.deleteDocument = async (req, res) => {
  const id = req.params.id;
  const doc = await Document.findByPk(id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  // delete dependent images and questions
  await QuestionImage.destroy({ where: { documentId: id }});
  await Question.destroy({ where: { documentId: id }});
  await doc.destroy();
  return res.json({ success: true });
};
