import React, { useEffect, useState } from "react";
import { ref, onValue, set, push } from "firebase/database";
import { db } from "../firebase";

export default function Lobby({ gameId, onStart }) {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");

  useEffect(() => {
    const playersReference = ref(db, `games/${gameId}/players`);

    const unsubscribe = onValue(playersReference, (snapshot) => {
      const playersData = snapshot.val() || {};
      const playersArray = Object.values(playersData);
      setPlayers(playersArray);
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
    <div className="card">
      <h2 className="title mb-4">Sala de espera</h2>

      <ul className="list mb-4 max-h-56 overflow-auto">
        {players.map((player, index) => (
          <li key={index} className="px-4 py-2">
            {player.name}
          </li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Nombre nuevo jugador"
        value={newPlayerName}
        onChange={(event) => setNewPlayerName(event.target.value)}
        className="input mb-4"
      />

      <button onClick={addNewPlayer} className="btn btn-primary mb-6">
        Añadir jugador
      </button>

      <hr className="mb-6 border-gray-300" />

      <button
        onClick={onStart}
        disabled={players.length === 0}
        className={`btn btn-primary w-full ${
          players.length === 0 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Iniciar Juego
      </button>
    </div>
  );
}
