import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    prompt: '',
    answers: ['', '', '', ''],
    correctIndex: 0,
  });

  // --- GET Request: Fetch questions when the component mounts ---
  useEffect(() => {
    fetch('http://localhost:4000/questions')
      .then((response) => response.json())
      .then((data) => setQuestions(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  // --- POST Request: Add a new question ---
  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedQuestion = {
      prompt: newQuestion.prompt,
      answers: newQuestion.answers,
      correctIndex: newQuestion.correctIndex,
    };

    fetch('http://localhost:4000/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedQuestion),
    })
      .then((response) => response.json())
      .then((data) => {
        // Add new question to state and clear form
        setQuestions((prev) => [...prev, data]);
        setNewQuestion({ prompt: '', answers: ['', '', '', ''], correctIndex: 0 });
      })
      .catch((error) => console.error('Error adding question:', error));
  };

  // --- DELETE Request: Delete a question by ID ---
  const handleDelete = (id) => {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setQuestions((prev) => prev.filter((question) => question.id !== id)); // Remove the question from state
      })
      .catch((error) => console.error('Error deleting question:', error));
  };

  // --- PATCH Request: Update the correct answer for a question ---
  const handleCorrectAnswerChange = (id, newCorrectIndex) => {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correctIndex: newCorrectIndex }),
    })
      .then((response) => response.json())
      .then((updatedQuestion) => {
        // Update the correctIndex in the state
        setQuestions((prev) =>
          prev.map((question) =>
            question.id === id
              ? { ...question, correctIndex: updatedQuestion.correctIndex }
              : question
          )
        );
      })
      .catch((error) => console.error('Error updating question:', error));
  };

  // --- Handle input changes for question prompt ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Handle answer input changes ---
  const handleAnswerChange = (e, index) => {
    const newAnswers = [...newQuestion.answers];
    newAnswers[index] = e.target.value;
    setNewQuestion((prev) => ({
      ...prev,
      answers: newAnswers,
    }));
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* --- Form to add a new question --- */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="prompt"
          value={newQuestion.prompt}
          onChange={handleInputChange}
          placeholder="Enter question"
        />
        {newQuestion.answers.map((answer, index) => (
          <input
            key={index}
            type="text"
            value={answer}
            onChange={(e) => handleAnswerChange(e, index)}
            placeholder={`Answer ${index + 1}`}
          />
        ))}
        <select
          name="correctIndex"
          value={newQuestion.correctIndex}
          onChange={handleInputChange}
        >
          {newQuestion.answers.map((_, index) => (
            <option key={index} value={index}>
              {`Answer ${index + 1}`}
            </option>
          ))}
        </select>
        <button type="submit">Add Question</button>
      </form>

      {/* --- List of existing questions --- */}
      <h2>Question List</h2>
      <ul>
        {questions.map((question) => (
          <li key={question.id}>
            <div>
              <strong>{question.prompt}</strong>
              <ul>
                {question.answers.map((answer, index) => (
                  <li key={index}>{answer}</li>
                ))}
              </ul>
              {/* --- Dropdown to change correct answer --- */}
              <select
                value={question.correctIndex}
                onChange={(e) =>
                  handleCorrectAnswerChange(question.id, parseInt(e.target.value))
                }
              >
                {question.answers.map((_, index) => (
                  <option key={index} value={index}>
                    {`Answer ${index + 1}`}
                  </option>
                ))}
              </select>
              {/* --- Delete Button --- */}
              <button onClick={() => handleDelete(question.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
