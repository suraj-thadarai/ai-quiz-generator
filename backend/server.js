require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const Quiz = require("./models/Quiz");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/quizapp")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Endpoint to Generate Quiz
app.post("/api/generate-quiz", async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: "Topic is required" });

  try {
    const prompt = `Generate a 10-question multiple-choice quiz about "${topic}". 
           Return ONLY a valid JSON object with a single key "questions" containing an array of 10 objects. 
           Each object must have: "question" (string), "options" (array of 4 strings), and "correctAnswer" (string matching one of the options). 
           Do not include any markdown formatting or extra text.`;

    // Call local Ollama API
    const ollamaResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.2:3b",
        prompt: prompt,
        stream: false,
        format: "json", // Forces Ollama to output strict JSON
      },
      { timeout: 300000 },
    ); // 5 min timeout for local LLM generation

    const parsedData = JSON.parse(ollamaResponse.data.response);

    // Save to MongoDB
    const newQuiz = new Quiz({
      topic: topic,
      questions: parsedData.questions,
    });
    await newQuiz.save();

    res.json(newQuiz);
  } catch (error) {
    console.error("Error generating quiz:", error.message);
    res
      .status(500)
      .json({ error: "Failed to generate quiz. Ensure Ollama is running." });
  }
});

// Endpoint to get past quizzes
app.get("/api/quizzes", async (req, res) => {
  const quizzes = await Quiz.find().sort({ createdAt: -1 }).limit(10);
  res.json(quizzes);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
