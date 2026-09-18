   import { useState, useEffect } from 'react';
   import axios from 'axios';
   import './App.css';

   function App() {
       const [topic, setTopic] = useState('');
       const [quiz, setQuiz] = useState(null);
       const [pastQuizzes, setPastQuizzes] = useState([]);
       const [loading, setLoading] = useState(false);
       const [error, setError] = useState('');

       // Fetch past quizzes on load
       useEffect(() => {
           fetchPastQuizzes();
       }, []);

       const fetchPastQuizzes = async () => {
           try {
               const res = await axios.get('http://localhost:5000/api/quizzes');
               setPastQuizzes(res.data);
           } catch (err) {
               console.error("Error fetching past quizzes");
           }
       };

       const handleGenerate = async (e) => {
           e.preventDefault();
           if (!topic.trim()) return;
           
           setLoading(true);
           setError('');
           setQuiz(null);

           try {
               const res = await axios.post('http://localhost:5000/api/generate-quiz', { topic });
               setQuiz(res.data);
               fetchPastQuizzes(); // Refresh history
           } catch (err) {
               setError('Failed to generate quiz. Make sure Ollama and Backend are running.');
           } finally {
               setLoading(false);
           }
       };

       return (
           <div className="container">
               <h1>AI Quiz Generator</h1>
               
               <form onSubmit={handleGenerate} className="input-form">
                   <input 
                       type="text" 
                       placeholder="Enter a topic (e.g., Quantum Physics)" 
                       value={topic}
                       onChange={(e) => setTopic(e.target.value)}
                       disabled={loading}
                   />
                   <button type="submit" disabled={loading}>
                       {loading ? 'Generating...' : 'Generate Quiz'}
                   </button>
               </form>

               {error && <p className="error">{error}</p>}

               {quiz && (
                   <div className="quiz-container">
                       <h2>Quiz: {quiz.topic}</h2>
                       {quiz.questions.map((q, index) => (
                           <div key={index} className="question-card">
                               <p><strong>Q{index + 1}: {q.question}</strong></p>
                               <ul>
                                   {q.options.map((opt, i) => (
                                       <li key={i} className={opt === q.correctAnswer ? 'correct' : ''}>
                                           {opt} {opt === q.correctAnswer && '✓'}
                                       </li>
                                   ))}
                               </ul>
                           </div>
                       ))}
                   </div>
               )}

               <div className="history">
                   <h3>Recent Quizzes</h3>
                   <ul>
                       {pastQuizzes.map(pq => (
                           <li key={pq._id} onClick={() => setQuiz(pq)} style={{cursor: 'pointer'}}>
                               {pq.topic} <small>({new Date(pq.createdAt).toLocaleDateString()})</small>
                           </li>
                       ))}
                   </ul>
               </div>
           </div>
       );
   }

   export default App;