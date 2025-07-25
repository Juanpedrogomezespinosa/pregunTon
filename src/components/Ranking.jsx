import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Ranking({ gameId }) {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!gameId) return;

    const playersRef = ref(db, `games/${gameId}/players`);
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const jugadoresOrdenados = Object.values(data).sort(
        (a, b) => (b.score || 0) - (a.score || 0)
      );
      setPlayers(jugadoresOrdenados);
    });

    return () => unsubscribe();
  }, [gameId]);

  useEffect(() => {
    const rol = localStorage.getItem("role");
    const redireccion = setTimeout(() => {
      if (rol === "host") {
        navigate("/host");
      } else {
        navigate("/player");
      }
    }, 20000);

    return () => clearTimeout(redireccion);
  }, [navigate]);

  return (
    <div className="container-app">
      <h2 className="title mb-4">Ranking Final</h2>
      <ul className="list">
        {players.map((player, index) => (
          <li
            key={index}
            className="ranking-item"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 1rem",
              borderBottom: "1px solid #e5e5e5",
            }}
          >
            <span style={{ fontWeight: "500", fontSize: "1rem" }}>
              {player.name}
            </span>
            <span
              style={{
                fontWeight: "700",
                fontSize: "1rem",
                color: "#374151",
              }}
            >
              {player.score || 0} puntos
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
