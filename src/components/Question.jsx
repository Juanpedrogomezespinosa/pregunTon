// src/components/Question.jsx
import React, { useEffect, useState, useRef } from "react";

export default function Question({
  questionIndex,
  questions,
  onAnswer,
  onTimeOut,
  showTimer = true,
  disabled = false,
}) {
  const TIEMPO_TOTAL = 20;
  const [secondsLeft, setSecondsLeft] = useState(TIEMPO_TOTAL);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const timerRef = useRef(null);

  const question = questions[questionIndex];

  useEffect(() => {
    setSecondsLeft(TIEMPO_TOTAL);
    setSelectedAnswer(null);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsLeft((segundos) => {
        if (segundos <= 1) {
          clearInterval(timerRef.current);
          if (onTimeOut) {
            setTimeout(() => onTimeOut(), 0);
          }
          return 0;
        }
        return segundos - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questionIndex, onTimeOut]);

  const manejarClickRespuesta = (opcion) => {
    if (disabled || selectedAnswer !== null) return;

    setSelectedAnswer(opcion);

    const esCorrecta = opcion === question.options[question.answer];

    const tiempoUsado = TIEMPO_TOTAL - secondsLeft;

    if (onAnswer) onAnswer(esCorrecta, tiempoUsado);
  };

  if (!question || !Array.isArray(question.options)) {
    return <div className="mt-20">Cargando pregunta...</div>;
  }

  return (
    <div className="mt-10 p-4 border rounded shadow text-left">
      <h3 className="text-xl font-semibold mb-4">
        Pregunta {questionIndex + 1}: {question.question}
      </h3>

      {showTimer && (
        <p className="text-sm text-gray-600 mb-4">
          Tiempo restante: <strong>{secondsLeft}</strong> segundos
        </p>
      )}

      <ul className="space-y-2">
        {question.options.map((opcion, indice) => (
          <li key={indice}>
            <button
              disabled={disabled}
              onClick={() => manejarClickRespuesta(opcion)}
              className={`w-full text-left px-4 py-2 rounded border transition-colors duration-200 ${
                selectedAnswer === opcion
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {opcion}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
