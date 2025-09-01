import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
  const maxQuestions = 20;

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

  const [selectedLang, setSelectedLang] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [usedIndices, setUsedIndices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [answered, setAnswered] = useState({
    status: "unanswered",
    selected: null,
  });
  const [reset, setReset] = useState(false);

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.theme = theme;
  }, [theme]);

  // Fetch questions when language is selected
  useEffect(() => {
    if (!selectedLang) return;

    const fileMap = { en: "countries", fr: "pays" };
    const fileName = fileMap[selectedLang];

    fetch(`/api/${fileName}`)
      .then((res) => res.json())
      .then((data) => {
        const shuffled = shuffleQuestions(data, maxQuestions);
        const randomizedData = randomizeOptions(shuffled);

        if (!randomizedData.length) {
          console.warn("No questions available");
          setLoading(false);
          return;
        }

        setQuestions(randomizedData);
        const firstIndex = getUniqueRandomIndex([], randomizedData.length);
        if (firstIndex !== null) {
          setCurrentIndex(firstIndex);
          setUsedIndices([firstIndex]);
          setGameStarted(true);
        }
      })
      .catch((err) => console.error(`Error loading ${fileName}:`, err))
      .finally(() => setLoading(false));
  }, [selectedLang]);

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

  // Shuffle helpers
  function shuffleArray(array) {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  function shuffleQuestions(array, maxQuestions) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result.slice(0, maxQuestions);
  }

  function randomizeOptions(data) {
    return data.map((q) => ({
      ...q,
      options: shuffleArray([...q.options]),
    }));
  }

  // Start game
  const handleStart = (lang) => {
    if (selectedLang === lang) return;
    setSelectedLang(lang);
    setLoading(true);
  };

  // Next question
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

  // Answer handler
  const handleAnswer = (rep, qAnswer) => {
    if (answered.status !== "unanswered") return;
    const isCorrect = rep === qAnswer;
    if (isCorrect) setScore((prev) => prev + 1);
    setAnswered({ status: isCorrect ? "correct" : "incorrect", selected: rep });
    setReset(false);
  };

  // Button styling
  const getButtonClass = (rep, qAnswer) => {
    if (answered.status === "unanswered" || reset) return "btn bg-zzlink";
    if (rep === qAnswer) return "btn bg-green-500";
    if (rep === answered.selected) return "btn bg-red-500";
    return "btn bg-zzlink";
  };

  // Theme toggle
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Start screen
  const startGame = () => (
    <>
      <div className="boxTimer"></div>
      <div className="boxTitle text-center">
        <h2 className="font-extrabold text-3xl md:text-4xl">{t("title")}</h2>
        <p className="text-xs md:text-sm">{t("description")}</p>
      </div>
      <div className="boxAnswer">
        <button className="btn bg-zzlink" onClick={() => handleStart("en")}>
          {t("english")}
        </button>
        <button className="btn bg-zzlink" onClick={() => handleStart("fr")}>
          {t("francais")}
        </button>
      </div>
      <div className="boxFooter"></div>
    </>
  );

  // Quiz screen
  const renderAnswers = () => {
    const q = questions[currentIndex];
    if (!q)
      return (
        <p>
          ⚠️ {t("erroranswer")} {currentIndex}
        </p>
      );

    const qAnswer = q.capital;

    if (usedIndices.length >= maxQuestions) {
      return (
        <>
          <div className="boxTimer"></div>
          <div className="boxTitle text-center">
            <h2 className="font-extrabold text-3xl md:text-4xl">
              {t("completed")}
            </h2>
            <p className="font-extrabold text-sm">
              {t("1")} {score} {t("2")} {maxQuestions} {t("3")}
            </p>
          </div>
          <div className="boxAnswer">
            <button
              className="btn bg-zzlink mt-4"
              onClick={() => window.location.reload()}
            >
              {t("restart")}
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
          <h2 className="font-extrabold text-xl md:text-2xl">
            {t("answer")} {q.country}?
          </h2>
        </div>
        <div className="boxAnswer">
          {q.options.map((rep, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(rep, qAnswer)}
              className={getButtonClass(rep, qAnswer)}
              disabled={answered.status !== "unanswered"}
              role="button"
              aria-pressed={answered.selected === rep}
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
        {loading ? (
          <p>⏳ Loading quiz...</p>
        ) : gameStarted ? (
          renderAnswers()
        ) : (
          startGame()
        )}
      </div>
      <div className="fixed bottom-5 right-5 md:right-10 text-2xl md:text-3xl text-zzlightbase dark:text-zzdarkbase flex flex-row gap-5">
        <button onClick={toggleTheme} className="toggle-color toggle-mode">
          {theme === "dark" ? <GrSun /> : <FiMoon />}
        </button>

        <div>
          <p
            className={`cursor-pointer ${
              i18n.language === "fr" ? "hidden" : ""
            } `}
            onClick={() => i18n.changeLanguage("fr")}
          >
            Francais
          </p>
          <p
            className={`cursor-pointer  ${
              i18n.language === "en" ? "hidden" : ""
            } `}
            onClick={() => i18n.changeLanguage("en")}
          >
            English
          </p>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
