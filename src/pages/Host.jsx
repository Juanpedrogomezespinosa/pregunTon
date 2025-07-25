import React, { useState, useEffect, useRef } from "react";
import { ref, set, update, get } from "firebase/database";
import { db } from "../firebase";
import Lobby from "../components/Lobby";
import Question from "../components/Question";
import Ranking from "../components/Ranking";
import allQuestions from "../data/questions.json";

function generarIdPartida(longitud = 6) {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let resultado = "";
  for (let i = 0; i < longitud; i++) {
    resultado += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }
  return resultado;
}

function seleccionarPreguntasAleatorias(lista, cantidad) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, cantidad);
}

const TIEMPO_PREGUNTA = 20;
const MAXIMO_PREGUNTAS = 20;

export default function Host() {
  const [gameId, setGameId] = useState("");
  const [stage, setStage] = useState("crear");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(TIEMPO_PREGUNTA);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!gameId) return;

    const gameReference = ref(db, `games/${gameId}`);

    const preguntasSeleccionadas = seleccionarPreguntasAleatorias(
      allQuestions,
      MAXIMO_PREGUNTAS
    );
    setQuestions(preguntasSeleccionadas);

    set(gameReference, {
      stage: "lobby",
      players: {},
      currentQuestionIndex: 0,
      questions: preguntasSeleccionadas,
    });

    setStage("lobby");
  }, [gameId]);

  useEffect(() => {
    if (stage !== "question") return;

    setSecondsLeft(TIEMPO_PREGUNTA);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          avanzarPreguntaAutomaticamente();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, currentQuestionIndex]);

  const avanzarPreguntaAutomaticamente = async () => {
    if (!gameId) return;

    const gameReference = ref(db, `games/${gameId}`);

    if (currentQuestionIndex + 1 < questions.length) {
      const siguientePregunta = currentQuestionIndex + 1;
      setCurrentQuestionIndex(siguientePregunta);
      await update(gameReference, {
        stage: "question",
        currentQuestionIndex: siguientePregunta,
      });
    } else {
      await update(gameReference, {
        stage: "ranking",
      });
      setStage("ranking");
    }
  };

  const iniciarJuego = async () => {
    if (!gameId) return;

    const gameReference = ref(db, `games/${gameId}`);

    await update(gameReference, {
      stage: "question",
      currentQuestionIndex: 0,
    });

    setCurrentQuestionIndex(0);
    setStage("question");
    setSecondsLeft(TIEMPO_PREGUNTA);
  };

  const manejarRespuestaHost = async (esCorrecta, tiempo) => {
    if (!gameId) return;

    const hostReference = ref(db, `games/${gameId}/players/HOST`);
    const snapshot = await get(hostReference);
    const puntuacionActual = snapshot.exists() ? snapshot.val().score || 0 : 0;

    const puntosBase = esCorrecta ? 10 : 0;
    const puntosPorTiempo = esCorrecta ? Math.max(0, 10 - tiempo) : 0;
    const puntosTotales = puntosBase + puntosPorTiempo;

    await update(hostReference, {
      name: "Host",
      score: puntuacionActual + puntosTotales,
    });
  };

  return (
    <div className="container-app">
      {stage === "crear" && (
        <div className="flex flex-col gap-4">
          <h2 className="title">Crear nueva partida</h2>
          <button
            onClick={() => setGameId(generarIdPartida())}
            className="btn btn-primary"
          >
            Generar Game ID
          </button>
        </div>
      )}

      {stage === "lobby" && (
        <>
          <h3 className="subtitle mb-3">
            Game ID:{" "}
            <span className="font-mono bg-gray-100 px-2 rounded">{gameId}</span>
          </h3>
          <Lobby gameId={gameId} onStart={iniciarJuego} />
        </>
      )}

      {stage === "question" && (
        <>
          <div className="timer mb-4 text-right">
            Tiempo restante: <strong>{secondsLeft}</strong> segundos
          </div>
          <Question
            questionIndex={currentQuestionIndex}
            questions={questions}
            onAnswer={manejarRespuestaHost}
            onTimeOut={() => {}}
            showTimer={false}
          />
        </>
      )}

      {stage === "ranking" && <Ranking gameId={gameId} />}
    </div>
  );
}
