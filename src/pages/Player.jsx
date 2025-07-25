import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ref, set, push, onValue, get } from "firebase/database";
import { db } from "../firebase";
import Question from "../components/Question";
import Ranking from "../components/Ranking";

export default function Player() {
  const [searchParams] = useSearchParams();
  const [gameId, setGameId] = useState("");
  const [name, setName] = useState("");
  const [stage, setStage] = useState("join");
  const [playerId, setPlayerId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [answeredThisQuestion, setAnsweredThisQuestion] = useState(false);

  const lastSeenQuestionRef = useRef(null);

  // Obtener Game ID desde URL al cargar
  useEffect(() => {
    const idDesdeUrl = searchParams.get("gameId");
    if (idDesdeUrl) {
      setGameId(idDesdeUrl.toUpperCase());
    }
  }, [searchParams]);

  // Escuchar cambios de etapa y de índice de pregunta
  useEffect(() => {
    if (!gameId || !playerId) return;

    const stageReference = ref(db, `games/${gameId}/stage`);
    const unsubscribeStage = onValue(stageReference, (snapshot) => {
      const nuevaEtapa = snapshot.val();
      if (!nuevaEtapa) return;

      if (stage === "score" && nuevaEtapa === "question") {
        setAnsweredThisQuestion(false);
      }

      setStage(nuevaEtapa);
    });

    const questionIndexReference = ref(
      db,
      `games/${gameId}/currentQuestionIndex`
    );
    const unsubscribeIndex = onValue(questionIndexReference, (snapshot) => {
      const indice = snapshot.val();
      if (indice === null || indice === undefined) return;

      if (lastSeenQuestionRef.current !== indice) {
        lastSeenQuestionRef.current = indice;
        setCurrentQuestionIndex(indice);
        setAnsweredThisQuestion(false);
      }
    });

    const questionsReference = ref(db, `games/${gameId}/questions`);
    const unsubscribeQuestions = onValue(questionsReference, (snapshot) => {
      const preguntasDesdeFirebase = snapshot.val();
      if (preguntasDesdeFirebase && Array.isArray(preguntasDesdeFirebase)) {
        setQuestions(preguntasDesdeFirebase);
      }
    });

    return () => {
      unsubscribeStage();
      unsubscribeIndex();
      unsubscribeQuestions();
    };
  }, [gameId, playerId, stage]);

  // Escuchar cambios en el puntaje personal
  useEffect(() => {
    if (!gameId || !playerId) return;

    const scoreReference = ref(db, `games/${gameId}/players/${playerId}/score`);
    const unsubscribeScore = onValue(scoreReference, (snapshot) => {
      setScore(snapshot.val() || 0);
    });

    return () => unsubscribeScore();
  }, [gameId, playerId]);

  // Guardar rol local para redirección desde Ranking.jsx
  useEffect(() => {
    localStorage.setItem("role", "player");
  }, []);

  const unirseAPartida = async () => {
    if (!gameId.trim() || !name.trim()) {
      alert("Por favor, introduce el Game ID y tu nombre.");
      return;
    }

    try {
      const playersReference = ref(db, `games/${gameId}/players`);
      const nuevoJugadorReference = push(playersReference);
      await set(nuevoJugadorReference, {
        name: name.trim(),
        score: 0,
      });

      setPlayerId(nuevoJugadorReference.key);
      setStage("waiting");
    } catch (error) {
      console.error("Error al unirse a la partida:", error);
      alert("Error al unirse a la partida. Verifica el Game ID.");
    }
  };

  const manejarRespuesta = async (esCorrecta, tiempo) => {
    if (answeredThisQuestion || !playerId || !gameId) return;

    const respuestaReference = ref(
      db,
      `games/${gameId}/answers/${currentQuestionIndex}/${playerId}`
    );
    const respuestaExistente = await get(respuestaReference);
    if (respuestaExistente.exists()) {
      setAnsweredThisQuestion(true);
      setStage("score");
      return;
    }

    try {
      await set(respuestaReference, {
        correct: esCorrecta,
        time: tiempo,
        timestamp: Date.now(),
      });

      const playerScoreReference = ref(
        db,
        `games/${gameId}/players/${playerId}/score`
      );
      const snapshot = await get(playerScoreReference);
      const puntuacionActual = snapshot.exists() ? snapshot.val() : 0;

      const puntosBase = esCorrecta ? 10 : 0;
      const puntosPorTiempo = esCorrecta ? Math.max(0, 10 - tiempo) : 0;
      const puntosTotales = puntosBase + puntosPorTiempo;

      const nuevaPuntuacion = puntuacionActual + puntosTotales;
      await set(playerScoreReference, nuevaPuntuacion);

      setAnsweredThisQuestion(true);
      setStage("score");
    } catch (error) {
      console.error("Error actualizando puntuación:", error);
    }
  };

  const manejarTiempoAgotado = () => {
    setAnsweredThisQuestion(true);
    setStage("score");
  };

  return (
    <div className="container-app">
      {stage === "join" && (
        <div className="flex flex-col gap-4">
          <h2 className="title">Unirse a la partida</h2>
          <input
            type="text"
            placeholder="Introduce el Game ID"
            value={gameId}
            onChange={(evento) => setGameId(evento.target.value.toUpperCase())}
            className="input"
            autoComplete="off"
          />
          <input
            type="text"
            placeholder="Introduce tu nombre"
            value={name}
            onChange={(evento) => setName(evento.target.value)}
            className="input"
            autoComplete="off"
          />
          <button
            onClick={unirseAPartida}
            disabled={!gameId.trim() || !name.trim()}
            className="btn btn-primary"
          >
            Unirme
          </button>
        </div>
      )}

      {stage === "waiting" && (
        <p className="text-center text-gray-400 font-semibold mt-20">
          Esperando a que el anfitrión inicie la partida o avance a la siguiente
          pregunta...
        </p>
      )}

      {(stage === "question" || stage === "score") && (
        <>
          {stage === "question" && questions.length > 0 && (
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
            <div className="mt-8 text-center">
              <h3 className="subtitle mb-2">Resumen de puntuación</h3>
              <p className="text-lg font-semibold">
                Tu puntuación acumulada es: <strong>{score}</strong> puntos
              </p>
              <p className="text-gray-500 mt-2">
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
