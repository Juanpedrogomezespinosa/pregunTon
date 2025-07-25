// src/pages/Host.jsx
import React, { useState, useEffect, useRef } from "react";
import { ref, set, update, get } from "firebase/database";
import { db } from "../firebase";
import Lobby from "../components/Lobby";
import Question from "../components/Question";
import Ranking from "../components/Ranking";
import questions from "../data/questions.json";

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

const TIEMPO_PREGUNTA = 5; // segundos

export default function Host() {
  const [gameId, setGameId] = useState("");
  const [stage, setStage] = useState("crear"); // crear | lobby | question | ranking
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TIEMPO_PREGUNTA);

  const timerRef = useRef(null);

  // Crea partida, sin jugadores al principio (host no incluido)
  useEffect(() => {
    if (!gameId) return;
    const gameRef = ref(db, `games/${gameId}`);

    set(gameRef, {
      stage: "lobby",
      players: {}, // vacío
      currentQuestionIndex: 0,
    });
    setStage("lobby");
  }, [gameId]);

  // Temporizador para avanzar pregunta automáticamente
  useEffect(() => {
    if (stage !== "question") return;

    setSecondsLeft(TIEMPO_PREGUNTA);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsLeft((segundos) => {
        if (segundos <= 1) {
          clearInterval(timerRef.current);
          avanzarPreguntaAutomaticamente();
          return 0;
        }
        return segundos - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, currentQuestionIndex]);

  // Función que avanza pregunta y sincroniza en Firebase
  const avanzarPreguntaAutomaticamente = async () => {
    if (!gameId) return;
    const gameRef = ref(db, `games/${gameId}`);

    if (currentQuestionIndex + 1 < questions.length) {
      const siguiente = currentQuestionIndex + 1;
      setCurrentQuestionIndex(siguiente);
      await update(gameRef, {
        stage: "question",
        currentQuestionIndex: siguiente,
      });
    } else {
      await update(gameRef, { stage: "ranking" });
      setStage("ranking");
    }
  };

  // Iniciar juego desde lobby
  const iniciarJuego = async () => {
    if (!gameId) return;
    const gameRef = ref(db, `games/${gameId}`);

    await update(gameRef, {
      stage: "question",
      currentQuestionIndex: 0,
    });

    setCurrentQuestionIndex(0);
    setStage("question");
    setSecondsLeft(TIEMPO_PREGUNTA);
  };

  // El host responde igual que los jugadores, se añade en jugadores si responde
  const manejarRespuestaHost = async (esCorrecta, tiempo) => {
    if (!gameId) return;

    const hostRef = ref(db, `games/${gameId}/players/HOST`);
    const snapshot = await get(hostRef);
    const puntuacionActual = snapshot.exists() ? snapshot.val().score || 0 : 0;

    const puntosBase = esCorrecta ? 10 : 0;
    const puntosPorTiempo = esCorrecta ? Math.max(0, 10 - tiempo) : 0;
    const puntosTotales = puntosBase + puntosPorTiempo;

    await update(hostRef, {
      name: "Host",
      score: puntuacionActual + puntosTotales,
    });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      {stage === "crear" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Crear nueva partida</h2>
          <button
            onClick={() => setGameId(generarIdPartida())}
            className="bg-blue-600 text-white px-6 py-3 rounded"
          >
            Generar Game ID
          </button>
        </div>
      )}

      {stage === "lobby" && (
        <>
          <h3 className="mb-2 font-semibold">
            Game ID: <span className="font-mono">{gameId}</span>
          </h3>
          <Lobby gameId={gameId} onStart={iniciarJuego} />
        </>
      )}

      {stage === "question" && (
        <>
          <div className="text-right mb-2 text-sm text-gray-600">
            Tiempo restante: <strong>{secondsLeft}</strong> segundos
          </div>

          <Question
            questionIndex={currentQuestionIndex}
            questions={questions}
            onAnswer={manejarRespuestaHost}
            onTimeOut={() => {}}
            showTimer={false} // El temporizador está fuera
          />
        </>
      )}

      {stage === "ranking" && <Ranking gameId={gameId} />}
    </div>
  );
}
