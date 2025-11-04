import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Activity = ({ user, setUser }) => {
  const [loginForm, setLoginForm] = useState({ name: '', phone: '' });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showBoard, setShowBoard] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const snap = await getDocs(collection(db, 'questions'));
    setQuestions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('activityUser', JSON.stringify(loginForm));
    setUser(JSON.stringify(loginForm));
  };

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.answer) correct++;
    });
    const finalScore = (correct / questions.length) * 100;
    setScore(finalScore);

    await addDoc(collection(db, 'scores'), {
      name: JSON.parse(user).name,
      phone: JSON.parse(user).phone,
      score: finalScore,
      timestamp: new Date()
    });
  };

  const fetchLeaderboard = async () => {
    const snap = await getDocs(collection(db, 'scores'));
    const scores = snap.docs.map(doc => doc.data());
    scores.sort((a, b) => b.score - a.score);
    setLeaderboard(scores);
    setShowBoard(true);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-teal-600 mb-6">Login to Take Exam</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Your Name" required
              className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={loginForm.name} onChange={e => setLoginForm({...loginForm, name: e.target.value})} />
            <input type="tel" placeholder="Phone Number" required
              className="w-full px-4 py-3 rounded-xl border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={loginForm.phone} onChange={e => setLoginForm({...loginForm, phone: e.target.value})} />
            <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition font-semibold">
              Start Exam
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showBoard) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-teal-600 mb-6">Leaderboard</h1>
          <div className="space-y-3">
            {leaderboard.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-teal-50 rounded-xl">
                <span className="font-semibold">{idx + 1}. {entry.name}</span>
                <span className="text-teal-600 font-bold">{entry.score.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (score !== null) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-teal-600 mb-4">Your Score</h1>
          <p className="text-6xl font-bold text-teal-500 mb-6">{score.toFixed(0)}%</p>
          <button onClick={fetchLeaderboard} className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition font-semibold">
            View Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-teal-600 mb-6">Exam</h1>
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-6 bg-teal-50 rounded-xl">
              <p className="font-semibold mb-3">{idx + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options?.map((opt, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name={q.id} value={opt}
                      onChange={() => setAnswers({...answers, [q.id]: opt})}
                      className="text-teal-600" />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSubmit} className="w-full mt-8 bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition font-semibold">
          Submit Exam
        </button>
      </div>
    </div>
  );
};

export default Activity;