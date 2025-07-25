import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ref, set, push, onValue, get } from "firebase/database";
import { db } from "../firebase";
import questions from "../data/questions.json";
import Question from "../components/Question";
import Ranking from "../components/Ranking";

export default function Player() {
  const [searchParams] = useSearchParams();

  // Estados
  const [gameId, setGameId] = useState("");
  const [name, setName] = useState("");
  const [stage, setStage] = useState("join"); // join | waiting | question | score | ranking
  const [playerId, setPlayerId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredThisQuestion, setAnsweredThisQuestion] = useState(false);

  // Ref para evitar conflicto en cambio de pregunta
  const lastSeenQuestionRef = useRef(null);

  // Prellenar gameId desde URL (solo una vez)
  useEffect(() => {
    const idFromUrl = searchParams.get("gameId");
    if (idFromUrl) {
      setGameId(idFromUrl.toUpperCase());
    }
  }, [searchParams]);

  // Escuchar stage y currentQuestionIndex SOLO si estamos en partida
  useEffect(() => {
    if (!gameId || !playerId) return;

    const stageRef = ref(db, `games/${gameId}/stage`);
    const unsubStage = onValue(stageRef, (snapshot) => {
      const newStage = snapshot.val();
      if (!newStage) return;

      // Si antes estabas en score y ahora en question, reiniciamos answeredThisQuestion para permitir responder
      if (stage === "score" && newStage === "question") {
        setAnsweredThisQuestion(false);
      }

      setStage(newStage);
    });

    const indexRef = ref(db, `games/${gameId}/currentQuestionIndex`);
    const unsubIndex = onValue(indexRef, (snapshot) => {
      const idx = snapshot.val();
      if (idx === null || idx === undefined) return;

      // Si cambia pregunta, reset answeredThisQuestion
      if (lastSeenQuestionRef.current !== idx) {
        lastSeenQuestionRef.current = idx;
        setCurrentQuestionIndex(idx);
        setAnsweredThisQuestion(false);
      }
    });

    return () => {
      unsubStage();
      unsubIndex();
    };
  }, [gameId, playerId, stage]);

  // Escuchar puntuación actual del jugador
  useEffect(() => {
    if (!gameId || !playerId) return;

    const scoreRef = ref(db, `games/${gameId}/players/${playerId}/score`);
    const unsubScore = onValue(scoreRef, (snapshot) => {
      setScore(snapshot.val() || 0);
    });

    return () => unsubScore();
  }, [gameId, playerId]);

  // Función para unirse a la partida
  const unirseAPartida = async () => {
    if (!gameId.trim() || !name.trim()) {
      alert("Por favor, introduce el Game ID y tu nombre.");
      return;
    }

    try {
      const playersRef = ref(db, `games/${gameId}/players`);
      const newPlayerRef = push(playersRef);
      await set(newPlayerRef, { name: name.trim(), score: 0 });
      setPlayerId(newPlayerRef.key);

      // Cambiamos localmente a "waiting" hasta que el host comience la partida
      setStage("waiting");
    } catch (error) {
      console.error("Error al unirse a la partida:", error);
      alert("Error al unirse a la partida. Verifica el Game ID.");
    }
  };

  // Función para manejar respuesta a pregunta
  const manejarRespuesta = async (esCorrecta, tiempo) => {
    if (answeredThisQuestion || !playerId || !gameId) return;

    const answerRef = ref(
      db,
      `games/${gameId}/answers/${currentQuestionIndex}/${playerId}`
    );

    const respuestaExistente = await get(answerRef);
    if (respuestaExistente.exists()) {
      setAnsweredThisQuestion(true);
      setStage("score");
      return;
    }

    try {
      await set(answerRef, {
        correct: esCorrecta,
        time: tiempo,
        timestamp: Date.now(),
      });

      const playerScoreRef = ref(
        db,
        `games/${gameId}/players/${playerId}/score`
      );
      const snapshot = await get(playerScoreRef);
      const puntuacionActual = snapshot.exists() ? snapshot.val() : 0;

      const puntosBase = esCorrecta ? 10 : 0;
      const puntosTiempo = esCorrecta ? Math.max(0, 10 - tiempo) : 0;
      const puntosTotales = puntosBase + puntosTiempo;

      const nuevaPuntuacion = puntuacionActual + puntosTotales;
      await set(playerScoreRef, nuevaPuntuacion);

      setAnsweredThisQuestion(true);
      setStage("score");
    } catch (error) {
      console.error("Error actualizando puntuación:", error);
    }
  };

  // Tiempo agotado sin responder
  const manejarTiempoAgotado = () => {
    setAnsweredThisQuestion(true);
    setStage("score");
  };

  return (
    <div className="p-4 max-w-xl mx-auto text-center">
      {stage === "join" && (
        <div className="space-y-4 text-left">
          <h2 className="text-xl font-bold">Unirse a la partida</h2>
          <input
            type="text"
            placeholder="Introduce el Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value.toUpperCase())}
            className="border p-2 w-full uppercase"
            autoComplete="off"
          />
          <input
            type="text"
            placeholder="Introduce tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full"
            autoComplete="off"
          />
          <button
            onClick={unirseAPartida}
            disabled={!gameId.trim() || !name.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            Unirme
          </button>
        </div>
      )}

      {stage === "waiting" && (
        <div className="mt-20 text-lg font-semibold">
          Esperando a que el anfitrión inicie la partida o avance a la siguiente
          pregunta...
        </div>
      )}

      {(stage === "question" || stage === "score") && (
        <>
          {stage === "question" && (
            <Question
              questionIndex={currentQuestionIndex}
              questions={questions}
              onAnswer={manejarRespuesta}
              onTimeOut={manejarTiempoAgotado}
              showTimer={true}
              disabled={answeredThisQuestion}
            />
          )}
          {stage === "score" && (
            <div className="mt-20">
              <h3 className="text-xl font-semibold mb-4">
                Resumen de puntuación
              </h3>
              <p className="mb-6 text-lg">
                Tu puntuación acumulada es: <strong>{score}</strong> puntos
              </p>
              <p className="text-gray-500">
                Espera a que el anfitrión pase a la siguiente pregunta…
              </p>
            </div>
          )}
        </>
      )}

      {stage === "ranking" && <Ranking gameId={gameId} />}
    </div>
  );
}
