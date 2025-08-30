import { useEffect, useState } from "react";

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [userAnswer, setUserAnswer] = useState("");

  useEffect(() => {
    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data[0]);
      })
      .catch((err) => console.error("Error fetching questions:", err));
  }, []);

  const renderAnswers = (c) => {
    const q = questions[c];

    const handleChange = (e) => {
      setUserAnswer(e.target.value);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log("User submitted:", userAnswer, "Reponce: ", q.answer);
    };

    if (!q) {
      return <p>⚠️ Question not found at index {c}</p>;
    }

    return (
      <div>
        <p>{q.question}</p>
        <br />
        <ul>
          {q.options.map((rep, i) => (
            <li key={i}>{rep}</li>
          ))}
        </ul>
        <input
          type="text"
          placeholder=".... ?"
          value={userAnswer}
          onChange={handleChange}
        />
        <button onClick={handleSubmit} type="submit">
          Submit
        </button>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz</h1>
      <span>{renderAnswers(7)}</span>
    </div>
  );
}

export default Quiz;
