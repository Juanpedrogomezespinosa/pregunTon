import React, { useEffect, useState, useRef } from "react";
import "./Question.css";

export default function Question({
  questionIndex,
  questions,
  onAnswer,
  onTimeOut,
  showTimer = true,
  disabled = false,
}) {
  const TIEMPO_TOTAL = 20;
  const [segundosRestantes, setSegundosRestantes] = useState(TIEMPO_TOTAL);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const referenciaTemporizador = useRef(null);

  const pregunta = questions[questionIndex];

  useEffect(() => {
    setSegundosRestantes(TIEMPO_TOTAL);
    setRespuestaSeleccionada(null);

    if (referenciaTemporizador.current) {
      clearInterval(referenciaTemporizador.current);
    }

    referenciaTemporizador.current = setInterval(() => {
      setSegundosRestantes((s) => {
        if (s <= 1) {
          clearInterval(referenciaTemporizador.current);
          if (onTimeOut) onTimeOut();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (referenciaTemporizador.current) {
        clearInterval(referenciaTemporizador.current);
      }
    };
  }, [questionIndex, onTimeOut]);

  const manejarClickRespuesta = (opcion) => {
    if (disabled || respuestaSeleccionada !== null) return;

    setRespuestaSeleccionada(opcion);

    const esCorrecta = opcion === pregunta.options[pregunta.answer];
    const tiempoUsado = TIEMPO_TOTAL - segundosRestantes;

    if (onAnswer) {
      onAnswer(esCorrecta, tiempoUsado);
    }
  };

  if (!pregunta || !Array.isArray(pregunta.options)) {
    return <p className="cargando">Cargando pregunta...</p>;
  }

  return (
    <div className="card">
      <h3 className="subtitle">
        Pregunta {questionIndex + 1}: {pregunta.question}
      </h3>

      {showTimer && (
        <p className="timer">
          Tiempo restante: <strong>{segundosRestantes}</strong> segundos
        </p>
      )}

      <ul className="question-options">
        {pregunta.options.map((opcion, indice) => {
          const esSeleccionada = respuestaSeleccionada === opcion;
          return (
            <li key={indice}>
              <button
                disabled={disabled}
                onClick={() => manejarClickRespuesta(opcion)}
                className={`answer-btn ${esSeleccionada ? "selected" : ""}`}
              >
                {opcion}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
