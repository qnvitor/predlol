
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LolPredictionForm from "./components/LolPredictionForm";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <Router>
      <div className="p-4 flex justify-between bg-gray-100 shadow-md mb-4">
        <Link to="/" className="font-bold text-blue-600">Predição</Link>
        <Link to="/dashboard" className="font-bold text-blue-600">Dashboard</Link>
      </div>
      <Routes>
        <Route path="/" element={<LolPredictionForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
