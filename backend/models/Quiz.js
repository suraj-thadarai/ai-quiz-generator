   const mongoose = require('mongoose');

   const questionSchema = new mongoose.Schema({
       question: String,
       options: [String],
       correctAnswer: String
   }, { _id: false });

   const quizSchema = new mongoose.Schema({
       topic: { type: String, required: true },
       questions: [questionSchema],
       createdAt: { type: Date, default: Date.now }
   });

   module.exports = mongoose.model('Quiz', quizSchema);