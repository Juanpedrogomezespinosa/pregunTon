import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import Host from "./pages/Host";
import Player from "./pages/Player";

export default function App() {
  return (
    <Router>
      <div className="p-6 text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">pregunTon</h1>
        <nav className="space-x-4 mb-6">
          <Link className="text-blue-500 underline" to="/host">
            Host
          </Link>
          <Link className="text-green-500 underline" to="/join">
            Jugador
          </Link>
        </nav>
        <Routes>
          <Route path="/" element={<Navigate to="/host" replace />} />
          <Route path="/host" element={<Host />} />
          <Route path="/join" element={<Player />} />
        </Routes>
      </div>
    </Router>
  );
}
