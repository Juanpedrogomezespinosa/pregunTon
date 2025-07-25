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
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">pregunTon</h1>

          <nav className="app-nav">
            <Link to="/host" className="nav-link">
              Host
            </Link>
            <Link to="/join" className="nav-link">
              Jugador
            </Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/host" replace />} />
            <Route path="/host" element={<Host />} />
            <Route path="/join" element={<Player />} />
          </Routes>
        </main>

        <footer className="app-footer">
          © {new Date().getFullYear()} pregunTon
        </footer>
      </div>
    </Router>
  );
}
