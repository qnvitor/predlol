import React, { useState, useEffect } from "react";

const RoleSelector = ({ side, role, champions, onChange, selectedChamps }) => (
  <div className="mb-2">
    <label className="block text-sm font-medium mb-1">{role} - {side}</label>
    <select
      className="w-full border rounded p-2"
      onChange={(e) => onChange(role, e.target.value)}
    >
      <option value="">Escolha um campeão</option>
      {champions.map((champ) => {
        const isSelected = selectedChamps.includes(champ);
        return (
          <option key={champ} value={champ} className={isSelected ? "text-gray-400" : ""}>
            {champ} {isSelected ? "(já escolhido)" : ""}
          </option>
        );
      })}
    </select>
  </div>
);

export default function LolPredictionForm() {
  const [roles, setRoles] = useState([]);
  const [champions, setChampions] = useState([]);
  const [blueTeam, setBlueTeam] = useState({});
  const [redTeam, setRedTeam] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Exibição bonita (UI) => Interno (modelo)
  const roleMap = {
    "Top": "TOP",
    "Jungle": "JUNGLE",
    "Mid": "MID",
    "ADCarry": "ADCARRY",
    "Support": "SUPPORT"
  };

  // Ordem exigida pelo modelo
  const modelRoleOrder = ["ADCARRY", "JUNGLE", "MID", "SUPPORT", "TOP"];

  useEffect(() => {
    setRoles(["Top", "Jungle", "Mid", "ADCarry", "Support"]);
    fetch(`${API_URL}/options`)
      .then(res => res.json())
      .then(data => {
        setChampions(data.champions);
      });
  }, []);

  const handleChange = (role, champ, side) => {
    const modelRole = roleMap[role];
    if (!modelRole) return;

    if (side === "Blue") {
      setBlueTeam((prev) => ({
        ...prev,
        [modelRole]: champ
      }));
    } else {
      setRedTeam((prev) => ({
        ...prev,
        [modelRole]: champ
      }));
    }
  };

  const handlePredict = async () => {
    if (modelRoleOrder.some((r) => !blueTeam[r] || !redTeam[r])) {
      alert("Preencha todos os picks dos dois times.");
      return;
    }
  
    const orderedBlueTeam = {};
    const orderedRedTeam = {};
    modelRoleOrder.forEach((role) => {
      orderedBlueTeam[role] = blueTeam[role];
      orderedRedTeam[role] = redTeam[role];
    });
  
    const payload = { blue: orderedBlueTeam, red: orderedRedTeam };
    console.log("Payload enviado ao backend:", payload);
  
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setPrediction(`${data.result} (Blue: ${Math.round(data.probability_blue * 100)}%, Red: ${Math.round(data.probability_red * 100)}%)`);
      } else {
        setPrediction(`Erro do servidor: ${data.error}`);
        console.error("Erro do backend:", data.error);
      }
    } catch (error) {
      console.error("Erro ao obter previsão:", error);
      setPrediction("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Time Azul</h2>
          {roles.map((role) => (
          <RoleSelector
            key={`blue-${role}`}
            side="Blue"
            role={role}
            champions={champions}
            onChange={(r, c) => handleChange(r, c, "Blue")}
            selectedChamps={[...Object.values(blueTeam), ...Object.values(redTeam)]}
          />
        ))}
      </div>

      <div className="flex justify-center items-center">
        <button
          onClick={handlePredict}
          className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Calculando..." : "Prever"}
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Time Vermelho</h2>
        {roles.map((role) => (
          <RoleSelector
            key={`red-${role}`}
            side="Red"
            role={role}
            champions={champions}
            onChange={(r, c) => handleChange(r, c, "Red")}
            selectedChamps={[...Object.values(blueTeam), ...Object.values(redTeam)]}
          />
        ))}
      </div>

      {prediction && (
        <div className="col-span-3 text-center mt-6">
          <p className="text-xl font-bold text-green-600">Resultado da predição: {prediction}</p>
        </div>
      )}
    </div>
  );
}
