import React from "react";

import { useEffect, useState } from "react";
import { ref, onValue, set, push } from "firebase/database";
import { db } from "../firebase";

export default function Lobby({ gameId, onStart }) {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");

  useEffect(() => {
    const playersReference = ref(db, `games/${gameId}/players`);
    const unsubscribe = onValue(playersReference, (snapshot) => {
      const playersData = snapshot.val() || {};
      setPlayers(Object.values(playersData));
    });
    return () => unsubscribe();
  }, [gameId]);

  const addNewPlayer = () => {
    const trimmedName = newPlayerName.trim();
    if (!trimmedName) return;
    const playersReference = ref(db, `games/${gameId}/players`);
    const newPlayerReference = push(playersReference);
    set(newPlayerReference, { name: trimmedName, score: 0 });
    setNewPlayerName("");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Sala de espera</h2>

      <ul className="mb-4">
        {players.map((player, index) => (
          <li key={index} className="border-b py-1">
            {player.name}
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Nombre nuevo jugador"
        value={newPlayerName}
        onChange={(event) => setNewPlayerName(event.target.value)}
        className="border p-2 mr-2"
      />
      <button
        onClick={addNewPlayer}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Añadir jugador
      </button>

      <hr className="my-4" />

      <button
        onClick={onStart}
        disabled={players.length === 0}
        className="bg-blue-600 text-white px-6 py-3 rounded disabled:bg-gray-400"
      >
        Iniciar Juego
      </button>
    </div>
  );
}
