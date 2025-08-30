import { useEffect, useState } from "react";
import { FiMoon } from "react-icons/fi";
import { GrSun } from "react-icons/gr";

// Utility to get a unique random index
function getUniqueRandomIndex(usedIndices, max) {
  const available = [...Array(max).keys()].filter(
    (i) => !usedIndices.includes(i)
  );
  if (available.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

function Quiz() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.theme ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light")
      );
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.theme = theme;
  }, [theme]);

  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const maxQuestions = 20;

  const [questions, setQuestions] = useState([]);
  const [usedIndices, setUsedIndices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [answered, setAnswered] = useState({
    status: "unanswered",
    selected: null,
  });
  const [reset, setReset] = useState(false);

  // Fetch and prepare questions
  useEffect(() => {
    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        function shuffleQuestion(array) {
          const result = [...array];
          for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
          }
          return result;
        }

        const shuffled = shuffleQuestion(data).slice(0, maxQuestions);

        // Shuffle function for options
        const shuffleArray = (array) =>
          array
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

        const randomizedData = shuffled.map((q) => ({
          ...q,
          options: shuffleArray([...q.options]), // 👈 true random shuffle here
        }));

        setQuestions(randomizedData);
      })
      .catch((err) => console.error("Error fetching questions:", err));
  }, []);

  // Start the game and pick the first question
  const handleStart = () => {
    const firstIndex = getUniqueRandomIndex([], questions.length);
    if (firstIndex !== null) {
      setCurrentIndex(firstIndex);
      setUsedIndices([firstIndex]);
      setGameStarted(true);
    }
  };

  // Go to next question
  const goToNextQuestion = () => {
    if (usedIndices.length >= maxQuestions) return;

    const nextIndex = getUniqueRandomIndex(usedIndices, questions.length);
    if (nextIndex !== null) {
      setCurrentIndex(nextIndex);
      setUsedIndices((prev) => [...prev, nextIndex]);
      setAnswered({ status: "unanswered", selected: null });
      setReset(false);
    }
  };

  // Auto-advance after answering
  useEffect(() => {
    if (answered.status !== "unanswered") {
      const timer = setTimeout(() => {
        goToNextQuestion();
        setReset(true);
        setAnswered({ status: "unanswered", selected: null });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [answered]);

  // Handle answer selection
  const handleAnswer = (rep, qAnswer) => {
    if (answered.status !== "unanswered") return; // Prevent multiple answers

    const isCorrect = rep === qAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setAnswered({
      status: isCorrect ? "correct" : "incorrect",
      selected: rep,
    });
    setReset(false);
  };

  // Button styling
  const getButtonClass = (rep, qAnswer) => {
    if (answered.status === "unanswered" || reset) return "btn bg-zzlink";
    if (rep === qAnswer) return "btn bg-green-500";
    if (rep === answered.selected) return "btn bg-red-500";
    return "btn bg-zzlink";
  };

  // Start screen
  const startGame = () => (
    <>
      <div className="boxTimer"></div>
      <div className="boxTitle text-center">
        <h2 className="font-extrabold text-3xl md:text-4xl">
          World Capitals Quiz
        </h2>
        <p className="text-xs md:text-sm">
          Test your geography skills by matching countries to their capitals.
        </p>
        <p className="text-xs md:text-sm">20 questions</p>
      </div>
      <div className="boxAnswer">
        <button className="btn bg-zzlink" onClick={handleStart}>
          Start the game
        </button>
      </div>
      <div className="boxFooter"></div>
    </>
  );

  // Quiz question and answers
  const renderAnswers = () => {
    const q = questions[currentIndex];
    if (!q) {
      return <p>⚠️ Question not found at index {currentIndex}</p>;
    }

    const qAnswer = q.answer;

    if (usedIndices.length >= maxQuestions) {
      return (
        <>
          <div className="boxTimer"></div>
          <div className="boxTitle text-center">
            <h2 className="font-extrabold text-3xl md:text-4xl">
              Quiz Completed!
            </h2>
            <p className="font-extrabold text-sm">
              You got {score} out of {maxQuestions} correct.
            </p>
          </div>
          <div className="boxAnswer">
            <button
              className="btn bg-zzlink mt-4"
              onClick={() => window.location.reload()}
            >
              Restart Quiz
            </button>
          </div>
          <div className="boxFooter"></div>
        </>
      );
    }

    return (
      <>
        <div className="boxTimer flex items-center justify-end font-extrabold px-6">
          {usedIndices.length}/{maxQuestions}
        </div>
        <div className="boxTitle">
          <h2 className="font-extrabold text-xl md:text-2xl">{q.question}</h2>
        </div>
        <div className="boxAnswer">
          {q.options.map((rep, i) => (
            <button
              onClick={() => handleAnswer(rep, qAnswer)}
              className={getButtonClass(rep, qAnswer)}
              key={i}
              disabled={answered.status !== "unanswered"}
              aria-label={`Answer option ${rep}`}
            >
              {rep}
            </button>
          ))}
        </div>
        <div className="boxFooter"></div>
      </>
    );
  };

  // Final render
  return (
    <div className="Zscreen bg-zzlighthighcontrast dark:bg-zzdarkhighcontrast">
      <div className="ZboxGeneral bg-zzlightlowcontrast dark:bg-zzdarklowcontrast text-zzlightbase dark:text-zzdarkbase">
        {questions.length === 0 ? (
          <p>⏳ Loading questions...</p>
        ) : gameStarted ? (
          renderAnswers()
        ) : (
          startGame()
        )}
      </div>
      <div className="fixed bottom-5 right-5 md:right-10 text-2xl md:text-3xl text-zzlightbase dark:text-zzdarkbase">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="toggle-color toggle-mode"
        >
          {theme === "dark" ? <GrSun /> : <FiMoon />}
        </button>
      </div>
    </div>
  );
}

export default Quiz;
