// src/components/Ranking.jsx
import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

export default function Ranking({ gameId }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!gameId) return;

    const playersRef = ref(db, `games/${gameId}/players`);
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const playersArray = Object.entries(data).map(([id, player]) => ({
        id,
        ...player,
      }));
      // Ordenamos de mayor a menor puntuación
      playersArray.sort((a, b) => b.score - a.score);
      setPlayers(playersArray);
    });

    return () => unsubscribe();
  }, [gameId]);

  return (
    <div className="mt-10 p-4 border rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4">Ranking Final</h2>
      <ul className="space-y-2">
        {players.map((player, index) => (
          <li
            key={player.id}
            className="flex justify-between p-2 border-b last:border-none"
          >
            <span>
              {index + 1}. {player.name}
            </span>
            <span className="font-semibold">{player.score} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
